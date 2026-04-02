import { Hono } from 'hono'
import { requireAuth } from '../lib/auth.js'
import { store } from '../lib/store.js'
import type { PaginatedResponse, Task, TaskStatus } from '../types/domain.js'

function parsePositiveInteger(value: string | undefined, fallback: number) {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const taskRoutes = new Hono()

taskRoutes.get('/', (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const status = c.req.query('status') as TaskStatus | undefined
  const agentId = c.req.query('agentId')
  const dateFrom = c.req.query('dateFrom')
  const dateTo = c.req.query('dateTo')
  const page = parsePositiveInteger(c.req.query('page'), 1)
  const pageSize = parsePositiveInteger(c.req.query('pageSize'), 20)

  let tasks = [...store.tasks.values()]
    .filter((task) => task.userId === user.id)
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt))

  if (status) {
    tasks = tasks.filter((task) => task.status === status)
  }

  if (agentId) {
    tasks = tasks.filter((task) => task.agentId === agentId)
  }

  if (dateFrom) {
    tasks = tasks.filter((task) => task.startedAt >= dateFrom)
  }

  if (dateTo) {
    tasks = tasks.filter((task) => task.startedAt <= dateTo)
  }

  const total = tasks.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const offset = (page - 1) * pageSize
  const data = tasks.slice(offset, offset + pageSize)
  const response: PaginatedResponse<Task> = {
    data,
    total,
    page,
    pageSize,
    totalPages,
  }

  return c.json(response)
})

taskRoutes.get('/:id', (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const task = store.tasks.get(c.req.param('id'))
  if (!task || task.userId !== user.id) {
    return c.json({ message: 'Task not found' }, 404)
  }

  return c.json(task)
})

taskRoutes.post('/:id/cancel', (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  const task = store.tasks.get(c.req.param('id'))
  if (!task || task.userId !== user.id) {
    return c.json({ message: 'Task not found' }, 404)
  }

  if (task.status === 'queued' || task.status === 'running') {
    task.status = 'cancelled'
    task.completedAt = new Date().toISOString()
  }

  return c.body(null, 204)
})