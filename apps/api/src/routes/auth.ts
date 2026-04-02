import { Hono } from 'hono'
import { z } from 'zod'
import {
  clearRefreshCookie,
  createId,
  getRefreshTokenFromCookie,
  hashPassword,
  issueAccessToken,
  issueRefreshToken,
  revokeRefreshToken,
  setRefreshCookie,
  toAuthResponse,
  toPublicUser,
  verifyPassword,
} from '../lib/auth.js'
import { localstore } from '../lib/store.js'
import type { UserRecord } from '../types/domain.js'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
})

const registerSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
})

export const authRoutes = new Hono()

authRoutes.post('/login', async (c) => {
  const payload = loginSchema.parse(await c.req.json())
  const userId = localstore.usersByEmail.get(payload.email.toLowerCase())
  const user = userId ? localstore.users.get(userId) : null

  if (!user || !(await verifyPassword(payload.password, user.passwordHash))) {
    return c.json({ message: 'Invalid email or password' }, 401)
  }

  const token = issueAccessToken(user.id)
  const refresh = issueRefreshToken(user.id, payload.rememberMe)
  setRefreshCookie(c, refresh.token, refresh.maxAge)

  return c.json(toAuthResponse(toPublicUser(user), token))
})

authRoutes.post('/register', async (c) => {
  const payload = registerSchema.parse(await c.req.json())
  const email = payload.email.toLowerCase()

  if (localstore.usersByEmail.has(email)) {
    return c.json({ message: 'An account with this email already exists' }, 409)
  }

  const user: UserRecord = {
    id: createId('user'),
    email,
    name: payload.name,
    createdAt: new Date().toISOString(),
    passwordHash: await hashPassword(payload.password),
  }

  localstore.users.set(user.id, user)
  localstore.usersByEmail.set(email, user.id)

  const token = issueAccessToken(user.id)
  const refresh = issueRefreshToken(user.id)
  setRefreshCookie(c, refresh.token, refresh.maxAge)

  return c.json(toAuthResponse(toPublicUser(user), token), 201)
})

authRoutes.post('/refresh', (c) => {
  const refreshToken = getRefreshTokenFromCookie(c)
  const session = refreshToken ? localstore.refreshSessions.get(refreshToken) : null

  if (!session || session.expiresAt < Date.now()) {
    clearRefreshCookie(c)
    if (refreshToken) {
      revokeRefreshToken(refreshToken)
    }
    return c.json({ message: 'Refresh token expired' }, 401)
  }

  const user = localstore.users.get(session.userId)
  if (!user) {
    clearRefreshCookie(c)
    revokeRefreshToken(refreshToken)
    return c.json({ message: 'User not found' }, 401)
  }

  const token = issueAccessToken(user.id)
  return c.json(toAuthResponse(toPublicUser(user), token))
})

authRoutes.post('/logout', (c) => {
  const refreshToken = getRefreshTokenFromCookie(c)
  revokeRefreshToken(refreshToken)
  clearRefreshCookie(c)
  return c.body(null, 204)
})

authRoutes.post('/forgot-password', async (c) => {
  const payload = forgotPasswordSchema.parse(await c.req.json())
  const userId = localstore.usersByEmail.get(payload.email.toLowerCase())

  if (userId) {
    const token = createId('reset')
    localstore.passwordResets.set(token, {
      token,
      userId,
      expiresAt: Date.now() + 1000 * 60 * 30,
    })
  }

  return c.body(null, 204)
})

authRoutes.post('/reset-password', async (c) => {
  const payload = resetPasswordSchema.parse(await c.req.json())
  const reset = localstore.passwordResets.get(payload.token)

  if (!reset || reset.expiresAt < Date.now() || reset.usedAt) {
    return c.json({ message: 'Reset token is invalid or expired' }, 400)
  }

  const user = localstore.users.get(reset.userId)
  if (!user) {
    return c.json({ message: 'User not found' }, 404)
  }

  user.passwordHash =  await hashPassword(payload.password)
  reset.usedAt = Date.now()

  return c.body(null, 204)
})