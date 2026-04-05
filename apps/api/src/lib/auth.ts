import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { Context } from 'hono'
import { prisma } from './db.js'
import { toUserRecord } from './serializers.js'
import type { AuthResponse, User, UserRecord } from '../types/domain.js'

const ACCESS_TOKEN_PREFIX = 'atk_'
const REFRESH_TOKEN_PREFIX = 'rtk_'
const REFRESH_COOKIE = 'refresh_token'
const ACCESS_TOKEN_TTL = 15 * 60 // 15 minutes in seconds

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

export async function hashPassword(password: string) {
  return Bun.password.hash(password, { algorithm: "argon2id" })
}

export async function verifyPassword(password: string, passwordHash: string) {
  return Bun.password.verify(password, passwordHash)
}

export async function issueAccessToken(userId: string) {
  const token = `${ACCESS_TOKEN_PREFIX}${crypto.randomUUID()}`
  await prisma.accessToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL * 1000),
    },
  })
  return token
}

export async function issueRefreshToken(userId: string, rememberMe = false) {
  const token = `${REFRESH_TOKEN_PREFIX}${crypto.randomUUID()}`
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7

  await prisma.refreshSession.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + maxAge * 1000),
    },
  })

  return { token, maxAge }
}

export function setRefreshCookie(c: Context, token: string, maxAge: number) {
  setCookie(c, REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  })
}

export function clearRefreshCookie(c: Context) {
  deleteCookie(c, REFRESH_COOKIE, {
    path: '/',
  })
}

export function getRefreshTokenFromCookie(c: Context) {
  return getCookie(c, REFRESH_COOKIE)
}

export async function revokeAccessToken(token?: string | null) {
  if (!token) return
  await prisma.accessToken.deleteMany({ where: { token } })
}

export async function revokeRefreshToken(token?: string | null) {
  if (!token) return
  await prisma.refreshSession.deleteMany({ where: { token } })
}

export async function getUserFromAccessToken(token?: string | null): Promise<UserRecord | null> {
  if (!token) return null

  const accessToken = await prisma.accessToken.findUnique({
    where: { token },
    select: {
      expiresAt: true,
      user: true,
    },
  })

  if (!accessToken) return null

  if (accessToken.expiresAt.getTime() < Date.now()) {
    await prisma.accessToken.delete({ where: { token } })
    return null
  }

  return toUserRecord(accessToken.user)
}

export function getBearerToken(c: Context) {
  const authorization = c.req.header('Authorization')
  if (!authorization?.startsWith('Bearer ')) return null
  return authorization.slice('Bearer '.length)
}

export async function requireAuth(c: Context): Promise<UserRecord | null> {
  const token = getBearerToken(c)
  const user = await getUserFromAccessToken(token)
  if (!user) {
    c.status(401)
    return null
  }
  return user
}

export function toPublicUser(user: UserRecord): User {
  const { passwordHash, ...publicUser } = user
  void passwordHash
  return publicUser
}

export function toAuthResponse(user: User, token: string): AuthResponse {
  return { user, token }
}