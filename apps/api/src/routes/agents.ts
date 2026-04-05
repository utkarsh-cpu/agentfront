import { Hono } from 'hono'
import { createId, requireAuth } from '../lib/auth.js'
import { prisma } from '../lib/db.js'
import {
  serializeStringArray,
  serializeToolCalls,
  serializeTokenUsage,
  toAgentRecord,
  toDomainMessage,
  toPublicAgent,
  toPublicTask,
} from '../lib/serializers.js'
import { runAgentTaskExecution, streamAgentReply } from '../services/execution.js'
import {
  createAgentSchema,
  updateAgentSchema,
  runAgentSchema,
  chatSchema,
} from '../types/domain.js'
import type {
  Message,
  UpdateAgentInput,
} from '../types/domain.js'

async function getAgentForUser(userId: string, agentId: string) {
  return prisma.agent.findFirst({
    where: {
      id: agentId,
      userId,
    },
  })
}

export const agentRoutes = new Hono()

agentRoutes.get('/', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agents = (await prisma.agent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  }))
    .map(toPublicAgent)

  return c.json(agents)
})

agentRoutes.post('/', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const payload = createAgentSchema.parse(await c.req.json())
  const agent = await prisma.agent.create({
    data: {
      id: createId('agent'),
      userId: user.id,
      name: payload.name,
      description: payload.description,
      modelName: payload.model,
      systemPrompt: payload.systemPrompt,
      toolsJson: serializeStringArray(payload.tools),
      status: 'idle',
      temperature: payload.temperature,
      maxTokens: payload.maxTokens,
    },
  })

  return c.json(toPublicAgent(agent), 201)
})

agentRoutes.post('/:id/chat', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agent = await getAgentForUser(user.id, c.req.param('id'))
  if (!agent) return c.json({ message: 'Agent not found' }, 404)

  const payload = chatSchema.parse(await c.req.json())
  const history = await prisma.message.findMany({
    where: { userId: user.id, agentId: agent.id },
    orderBy: { createdAt: 'asc' },
  })

  const userMessageRecord = await prisma.message.create({
    data: {
      id: createId('msg'),
      userId: user.id,
      agentId: agent.id,
      role: 'user',
      content: payload.message,
    },
  })

  const userMessage = toDomainMessage(userMessageRecord)
  const historyWithUserMessage: Message[] = [...history.map(toDomainMessage), userMessage]

  const encoder = new TextEncoder()
  let assistantContent = ''

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamAgentReply({
          agent: toAgentRecord(agent),
          message: payload.message,
          history: historyWithUserMessage,
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

        await prisma.message.create({
          data: {
            id: assistantMessage.id,
            userId: user.id,
            agentId: agent.id,
            role: assistantMessage.role,
            content: assistantMessage.content,
          },
        })
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

agentRoutes.get('/:id/chat/history', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agent = await getAgentForUser(user.id, c.req.param('id'))
  if (!agent) return c.json({ message: 'Agent not found' }, 404)

  const messages = await prisma.message.findMany({
    where: { userId: user.id, agentId: agent.id },
    orderBy: { createdAt: 'asc' },
  })

  return c.json(messages.map(toDomainMessage))
})

agentRoutes.delete('/:id/chat/history', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agent = await getAgentForUser(user.id, c.req.param('id'))
  if (!agent) return c.json({ message: 'Agent not found' }, 404)

  await prisma.message.deleteMany({
    where: { userId: user.id, agentId: agent.id },
  })
  return c.body(null, 204)
})

agentRoutes.post('/:id/run', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agent = await getAgentForUser(user.id, c.req.param('id'))
  if (!agent) return c.json({ message: 'Agent not found' }, 404)

  const payload = runAgentSchema.parse(await c.req.json())
  const startedAt = new Date()
  const taskId = createId('task')

  await prisma.$transaction([
    prisma.task.create({
      data: {
        id: taskId,
        userId: user.id,
        agentId: agent.id,
        agentName: agent.name,
        status: 'running',
        input: payload.input,
        toolCallsJson: serializeToolCalls([]),
        tokenUsageJson: serializeTokenUsage({ prompt: 0, completion: 0, total: 0 }),
        startedAt,
      },
    }),
    prisma.agent.update({
      where: { id: agent.id },
      data: { status: 'running' },
    }),
  ])

  try {
    const result = await runAgentTaskExecution({
      agent: toAgentRecord(agent),
      input: payload.input,
    })

    const [task] = await prisma.$transaction([
      prisma.task.update({
        where: { id: taskId },
        data: {
          status: result.status,
          output: result.output,
          toolCallsJson: serializeToolCalls(result.toolCalls),
          tokenUsageJson: serializeTokenUsage(result.tokenUsage),
          completedAt: new Date(),
        },
      }),
      prisma.agent.update({
        where: { id: agent.id },
        data: { status: 'idle' },
      }),
    ])

    return c.json(toPublicTask(task))
  } catch (error) {
    const [task] = await prisma.$transaction([
      prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'failed',
          output: error instanceof Error ? error.message : 'Task execution failed',
          completedAt: new Date(),
        },
      }),
      prisma.agent.update({
        where: { id: agent.id },
        data: { status: 'error' },
      }),
    ])

    return c.json(toPublicTask(task))
  }
})

agentRoutes.get('/:id', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agent = await getAgentForUser(user.id, c.req.param('id'))
  if (!agent) return c.json({ message: 'Agent not found' }, 404)

  return c.json(toPublicAgent(agent))
})

agentRoutes.patch('/:id', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agent = await getAgentForUser(user.id, c.req.param('id'))
  if (!agent) return c.json({ message: 'Agent not found' }, 404)

  const payload = updateAgentSchema.parse(await c.req.json()) as UpdateAgentInput

  const updatedAgent = await prisma.agent.update({
    where: { id: agent.id },
    data: {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.model !== undefined ? { modelName: payload.model } : {}),
      ...(payload.systemPrompt !== undefined ? { systemPrompt: payload.systemPrompt } : {}),
      ...(payload.tools !== undefined ? { toolsJson: serializeStringArray(payload.tools) } : {}),
      ...(payload.temperature !== undefined ? { temperature: payload.temperature } : {}),
      ...(payload.maxTokens !== undefined ? { maxTokens: payload.maxTokens } : {}),
    },
  })

  return c.json(toPublicAgent(updatedAgent))
})

agentRoutes.delete('/:id', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const agent = await getAgentForUser(user.id, c.req.param('id'))
  if (!agent) return c.json({ message: 'Agent not found' }, 404)

  await prisma.agent.delete({ where: { id: agent.id } })

  return c.body(null, 204)
})