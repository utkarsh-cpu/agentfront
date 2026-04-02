import { Hono } from 'hono'
import { z } from 'zod'
import { createId, requireAuth } from '../lib/auth.js'
import { localstore as store} from '../lib/store.js'
import { runAgentTaskExecution, streamAgentReply } from '../services/execution.js'
import type {
  AgentRecord,
  CreateAgentInput,
  Message,
  TaskRecord,
  UpdateAgentInput,
} from '../types/domain.js'

const createAgentSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(1),
  model: z.string().min(1),
  systemPrompt: z.string().min(1),
  tools: z.array(z.string()),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
})

const updateAgentSchema = createAgentSchema.partial()

const runAgentSchema = z.object({
  input: z.string().min(1),
})

const chatSchema = z.object({
  message: z.string().min(1),
})

function getAgentForUser(userId: string, agentId: string) {
  const agent = store.agents.get(agentId)
  if (!agent || agent.userId !== userId) {
    return null
  }

  return agent
}

function createAgentRecord(userId: string, payload: CreateAgentInput): AgentRecord {
  const now = new Date().toISOString()

  return {
    id: createId('agent'),
    userId,
    name: payload.name,
    description: payload.description,
    model: payload.model,
    systemPrompt: payload.systemPrompt,
    tools: payload.tools,
    status: 'idle',
    createdAt: now,
    updatedAt: now,
    temperature: payload.temperature,
    maxTokens: payload.maxTokens,
  }
}

function toPublicAgent(agent: AgentRecord) {
  const { userId, temperature, maxTokens, ...publicAgent } = agent
  void userId
  void temperature
  void maxTokens
  return publicAgent
}

export const agentRoutes = new Hono()

agentRoutes.get('/', (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agents = [...store.agents.values()]
    .filter((agent) => agent.userId === user.id)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map(toPublicAgent)

  return c.json(agents)
})

agentRoutes.post('/', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const payload = createAgentSchema.parse(await c.req.json())
  const agent = createAgentRecord(user.id, payload)
  store.agents.set(agent.id, agent)

  return c.json(toPublicAgent(agent), 201)
})

agentRoutes.post('/:id/chat', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agent = getAgentForUser(user.id, c.req.param('id'))
  if (!agent) return c.json({ message: 'Agent not found' }, 404)

  const payload = chatSchema.parse(await c.req.json())
  const history = store.getConversation(user.id, agent.id)
  const userMessage: Message = {
    id: createId('msg'),
    role: 'user',
    content: payload.message,
    createdAt: new Date().toISOString(),
  }

  store.setConversation(user.id, agent.id, [...history, userMessage])

  const encoder = new TextEncoder()
  let assistantContent = ''

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamAgentReply({
          agent,
          message: payload.message,
          history: [...history, userMessage],
          signal: c.req.raw.signal,
        })) {
          assistantContent += chunk
          const data = JSON.stringify({
            choices: [{ delta: { content: chunk } }],
          })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        }

        const assistantMessage: Message = {
          id: createId('msg'),
          role: 'assistant',
          content: assistantContent.trim(),
          createdAt: new Date().toISOString(),
        }

        store.setConversation(user.id, agent.id, [...store.getConversation(user.id, agent.id), assistantMessage])
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (error) {
        const data = JSON.stringify({ delta: 'An error occurred while streaming the response.' })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        console.error(error)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
})

agentRoutes.get('/:id/chat/history', (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agent = getAgentForUser(user.id, c.req.param('id'))
  if (!agent) return c.json({ message: 'Agent not found' }, 404)

  return c.json(store.getConversation(user.id, agent.id))
})

agentRoutes.delete('/:id/chat/history', (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agent = getAgentForUser(user.id, c.req.param('id'))
  if (!agent) return c.json({ message: 'Agent not found' }, 404)

  store.clearConversation(user.id, agent.id)
  return c.body(null, 204)
})

agentRoutes.post('/:id/run', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agent = getAgentForUser(user.id, c.req.param('id'))
  if (!agent) return c.json({ message: 'Agent not found' }, 404)

  const payload = runAgentSchema.parse(await c.req.json())
  const startedAt = new Date().toISOString()
  const taskId = createId('task')

  const task: TaskRecord = {
    id: taskId,
    userId: user.id,
    agentId: agent.id,
    agentName: agent.name,
    status: 'running',
    input: payload.input,
    toolCalls: [],
    tokenUsage: { prompt: 0, completion: 0, total: 0 },
    startedAt,
  }

  store.tasks.set(task.id, task)

  try {
    agent.status = 'running'
    agent.updatedAt = new Date().toISOString()

    const result = await runAgentTaskExecution({ agent, input: payload.input })
    task.status = result.status
    task.output = result.output
    task.toolCalls = result.toolCalls
    task.tokenUsage = result.tokenUsage
    task.completedAt = new Date().toISOString()
    agent.status = 'idle'
    agent.updatedAt = new Date().toISOString()
  } catch (error) {
    task.status = 'failed'
    task.output = error instanceof Error ? error.message : 'Task execution failed'
    task.completedAt = new Date().toISOString()
    agent.status = 'error'
    agent.updatedAt = new Date().toISOString()
  }

  return c.json(task)
})

agentRoutes.get('/:id', (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agent = getAgentForUser(user.id, c.req.param('id'))
  if (!agent) return c.json({ message: 'Agent not found' }, 404)

  return c.json(toPublicAgent(agent))
})

agentRoutes.patch('/:id', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agent = getAgentForUser(user.id, c.req.param('id'))
  if (!agent) return c.json({ message: 'Agent not found' }, 404)

  const payload = updateAgentSchema.parse(await c.req.json()) as UpdateAgentInput

  if (payload.name !== undefined) agent.name = payload.name
  if (payload.description !== undefined) agent.description = payload.description
  if (payload.model !== undefined) agent.model = payload.model
  if (payload.systemPrompt !== undefined) agent.systemPrompt = payload.systemPrompt
  if (payload.tools !== undefined) agent.tools = payload.tools
  if (payload.temperature !== undefined) agent.temperature = payload.temperature
  if (payload.maxTokens !== undefined) agent.maxTokens = payload.maxTokens
  agent.updatedAt = new Date().toISOString()

  return c.json(toPublicAgent(agent))
})

agentRoutes.delete('/:id', (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agent = getAgentForUser(user.id, c.req.param('id'))
  if (!agent) return c.json({ message: 'Agent not found' }, 404)

  store.agents.delete(agent.id)
  store.clearConversation(user.id, agent.id)

  for (const [taskId, task] of store.tasks.entries()) {
    if (task.userId === user.id && task.agentId === agent.id) {
      store.tasks.delete(taskId)
    }
  }

  return c.body(null, 204)
})