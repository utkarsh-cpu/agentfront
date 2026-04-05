import { Hono } from 'hono'
import { createId, requireAuth } from '../lib/auth.js'
import { prisma } from '../lib/db.js'
import {
  serializeStringArray,
  toConversation,
  toChatMessage,
} from '../lib/serializers.js'
import { streamConversationReply } from '../services/execution.js'
import {
  createConversationSchema,
  updateConversationSchema,
  chatMessageSchema,
} from '../types/domain.js'
import type { ChatMessage } from '../types/domain.js'

async function getConversationForUser(userId: string, conversationId: string) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  })
}

export const conversationRoutes = new Hono()

conversationRoutes.get('/', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const conversations = (await prisma.conversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  })).map(toConversation)

  return c.json(conversations)
})

conversationRoutes.post('/', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const payload = createConversationSchema.parse(await c.req.json())
  const conversation = await prisma.conversation.create({
    data: {
      id: createId('conv'),
      userId: user.id,
      modelName: payload.modelName,
      systemPrompt: payload.systemPrompt,
      toolsJson: serializeStringArray(payload.tools ?? []),
    },
  })

  return c.json(toConversation(conversation), 201)
})

conversationRoutes.get('/:id', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const conversation = await getConversationForUser(user.id, c.req.param('id'))
  if (!conversation) return c.json({ message: 'Conversation not found' }, 404)

  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'asc' },
  })

  return c.json({
    ...toConversation(conversation),
    messages: messages.map(toChatMessage),
  })
})

conversationRoutes.patch('/:id', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const conversation = await getConversationForUser(user.id, c.req.param('id'))
  if (!conversation) return c.json({ message: 'Conversation not found' }, 404)

  const payload = updateConversationSchema.parse(await c.req.json())
  const updated = await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.modelName !== undefined ? { modelName: payload.modelName } : {}),
      ...(payload.tools !== undefined ? { toolsJson: serializeStringArray(payload.tools) } : {}),
      ...(payload.systemPrompt !== undefined ? { systemPrompt: payload.systemPrompt } : {}),
    },
  })

  return c.json(toConversation(updated))
})

conversationRoutes.delete('/:id', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const conversation = await getConversationForUser(user.id, c.req.param('id'))
  if (!conversation) return c.json({ message: 'Conversation not found' }, 404)

  await prisma.conversation.delete({ where: { id: conversation.id } })

  return c.body(null, 204)
})

conversationRoutes.post('/:id/chat', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const conversation = await getConversationForUser(user.id, c.req.param('id'))
  if (!conversation) return c.json({ message: 'Conversation not found' }, 404)

  const payload = chatMessageSchema.parse(await c.req.json())

  const history = await prisma.chatMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'asc' },
  })

  const userMessageRecord = await prisma.chatMessage.create({
    data: {
      id: createId('cmsg'),
      conversationId: conversation.id,
      role: 'user',
      content: payload.message,
    },
  })

  const userMessage = toChatMessage(userMessageRecord)
  const historyWithUserMessage: ChatMessage[] = [...history.map(toChatMessage), userMessage]

  const conversationData = toConversation(conversation)

  // Auto-generate title from first user message
  if (conversation.title === 'New Conversation') {
    const title = payload.message.slice(0, 50) + (payload.message.length > 50 ? '...' : '')
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { title },
    })
  }

  const encoder = new TextEncoder()
  let assistantContent = ''

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamConversationReply({
          modelName: conversationData.modelName,
          systemPrompt: conversationData.systemPrompt,
          tools: conversationData.tools,
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

        const assistantMessageId = createId('cmsg')
        await prisma.chatMessage.create({
          data: {
            id: assistantMessageId,
            conversationId: conversation.id,
            role: 'assistant',
            content: assistantContent.trim(),
          },
        })

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() },
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
