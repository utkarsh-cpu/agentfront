import type { Context, MiddlewareHandler } from 'hono'

interface RateLimitOptions {
  windowMs: number
  max: number
}

const hits = new Map<string, { count: number; resetAt: number }>()

function getClientIp(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    c.req.header('x-real-ip') ??
    'unknown'
  )
}

export function rateLimiter(options: RateLimitOptions): MiddlewareHandler {
  const { windowMs, max } = options

  return async (c, next) => {
    const key = getClientIp(c)
    const now = Date.now()

    let entry = hits.get(key)
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs }
      hits.set(key, entry)
    }

    entry.count++

    c.header('X-RateLimit-Limit', String(max))
    c.header('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)))
    c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)))

    if (entry.count > max) {
      return c.json({ message: 'Too many requests, please try again later' }, 429)
    }

    await next()
  }
}
