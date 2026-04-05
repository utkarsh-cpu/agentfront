import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { authRoutes } from './routes/auth.js'
import { agentRoutes } from './routes/agents.js'
import { taskRoutes } from './routes/tasks.js'
import { rateLimiter } from './middleware/rate-limit.js'

const app = new Hono()

app.use('*', logger())
app.use('*', secureHeaders())
app.use(
  '/api/*',
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
)

// Rate limit auth endpoints: 20 requests per minute per IP
app.use('/api/auth/*', rateLimiter({ windowMs: 60_000, max: 20 }))

app.get('/api/health', (c) => {
  return c.json({ status: 'ok' })
})

app.route('/api/auth', authRoutes)
app.route('/api/agents', agentRoutes)
app.route('/api/tasks', taskRoutes)

app.onError((error, c) => {
  console.error(error)

  if (error.name === 'ZodError') {
    return c.json({ message: 'Validation failed', issues: error }, 400)
  }

  return c.json({ message: error.message || 'Internal server error' }, 500)
})

export default app