import { Hono } from 'hono'
import {
  clearRefreshCookie,
  createId,
  getBearerToken,
  getRefreshTokenFromCookie,
  hashPassword,
  issueAccessToken,
  issueRefreshToken,
  revokeAccessToken,
  revokeRefreshToken,
  setRefreshCookie,
  toAuthResponse,
  toPublicUser,
  verifyPassword,
} from '../lib/auth.js'
import { prisma } from '../lib/db.js'
import { toUserRecord } from '../lib/serializers.js'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../types/domain.js'

export const authRoutes = new Hono()

authRoutes.post('/login', async (c) => {
  const payload = loginSchema.parse(await c.req.json())
  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  })

  if (!user || !(await verifyPassword(payload.password, user.passwordHash))) {
    return c.json({ message: 'Invalid email or password' }, 401)
  }

  const token = await issueAccessToken(user.id)
  const refresh = await issueRefreshToken(user.id, payload.rememberMe)
  setRefreshCookie(c, refresh.token, refresh.maxAge)

  return c.json(toAuthResponse(toPublicUser(toUserRecord(user)), token))
})

authRoutes.post('/register', async (c) => {
  const payload = registerSchema.parse(await c.req.json())
  const email = payload.email.toLowerCase()

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return c.json({ message: 'An account with this email already exists' }, 409)
  }

  const user = await prisma.user.create({
    data: {
      id: createId('user'),
      email,
      name: payload.name,
      passwordHash: await hashPassword(payload.password),
    },
  })

  const token = await issueAccessToken(user.id)
  const refresh = await issueRefreshToken(user.id)
  setRefreshCookie(c, refresh.token, refresh.maxAge)

  return c.json(toAuthResponse(toPublicUser(toUserRecord(user)), token), 201)
})

authRoutes.post('/refresh', async (c) => {
  const refreshToken = getRefreshTokenFromCookie(c)
  const session = refreshToken
    ? await prisma.refreshSession.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      })
    : null

  if (!session || session.expiresAt.getTime() < Date.now()) {
    clearRefreshCookie(c)
    if (refreshToken) {
      await revokeRefreshToken(refreshToken)
    }
    return c.json({ message: 'Refresh token expired' }, 401)
  }

  const user = session.user
  if (!user) {
    clearRefreshCookie(c)
    await revokeRefreshToken(refreshToken)
    return c.json({ message: 'User not found' }, 401)
  }

  const token = await issueAccessToken(user.id)
  return c.json(toAuthResponse(toPublicUser(toUserRecord(user)), token))
})

authRoutes.post('/logout', async (c) => {
  const refreshToken = getRefreshTokenFromCookie(c)
  const accessToken = getBearerToken(c)
  await Promise.all([revokeRefreshToken(refreshToken), revokeAccessToken(accessToken)])
  clearRefreshCookie(c)
  return c.body(null, 204)
})

authRoutes.post('/forgot-password', async (c) => {
  const payload = forgotPasswordSchema.parse(await c.req.json())
  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
    select: { id: true },
  })

  if (user) {
    await prisma.passwordReset.create({
      data: {
        token: createId('reset'),
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    })
  }

  return c.body(null, 204)
})

authRoutes.post('/reset-password', async (c) => {
  const payload = resetPasswordSchema.parse(await c.req.json())
  const reset = await prisma.passwordReset.findUnique({
    where: { token: payload.token },
    include: { user: true },
  })

  if (!reset || reset.expiresAt.getTime() < Date.now() || reset.usedAt) {
    return c.json({ message: 'Reset token is invalid or expired' }, 400)
  }

  const user = reset.user
  if (!user) {
    return c.json({ message: 'User not found' }, 404)
  }

  const newPasswordHash = await hashPassword(payload.password)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    }),
    prisma.passwordReset.update({
      where: { token: reset.token },
      data: { usedAt: new Date() },
    }),
  ])

  return c.body(null, 204)
})