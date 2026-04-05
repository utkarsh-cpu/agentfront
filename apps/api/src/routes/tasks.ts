import { Hono } from 'hono'
import { requireAuth } from '../lib/auth.js'
import { prisma } from '../lib/db.js'
import { toPublicTask } from '../lib/serializers.js'
import type { PaginatedResponse, Task, TaskStatus } from '../types/domain.js'

function parsePositiveInteger(value: string | undefined, fallback: number) {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const taskRoutes = new Hono()

taskRoutes.get('/', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const status = c.req.query('status') as TaskStatus | undefined
  const agentId = c.req.query('agentId')
  const dateFrom = c.req.query('dateFrom')
  const dateTo = c.req.query('dateTo')
  const page = parsePositiveInteger(c.req.query('page'), 1)
  const pageSize = parsePositiveInteger(c.req.query('pageSize'), 20)

  const where: {
    userId: string
    status?: TaskStatus
    agentId?: string
    startedAt?: {
      gte?: Date
      lte?: Date
    }
  } = {
    userId: user.id,
  }

  if (status) where.status = status
  if (agentId) where.agentId = agentId

  if (dateFrom || dateTo) {
    where.startedAt = {}
    if (dateFrom) {
      const from = new Date(dateFrom)
      if (!Number.isNaN(from.getTime())) {
        where.startedAt.gte = from
      }
    }
    if (dateTo) {
      const to = new Date(dateTo)
      if (!Number.isNaN(to.getTime())) {
        where.startedAt.lte = to
      }
    }
  }

  const [total, tasks] = await prisma.$transaction([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const response: PaginatedResponse<Task> = {
    data: tasks.map(toPublicTask),
    total,
    page,
    pageSize,
    totalPages,
  }

  return c.json(response)
})

taskRoutes.get('/:id', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const task = await prisma.task.findFirst({
    where: {
      id: c.req.param('id'),
      userId: user.id,
    },
  })

  if (!task || task.userId !== user.id) {
    return c.json({ message: 'Task not found' }, 404)
  }

  return c.json(toPublicTask(task))
})

taskRoutes.post('/:id/cancel', async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const task = await prisma.task.findFirst({
    where: {
      id: c.req.param('id'),
      userId: user.id,
    },
  })

  if (!task || task.userId !== user.id) {
    return c.json({ message: 'Task not found' }, 404)
  }

  if (task.status === 'queued' || task.status === 'running') {
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: 'cancelled',
        completedAt: new Date(),
      },
    })
  }

  return c.body(null, 204)
})