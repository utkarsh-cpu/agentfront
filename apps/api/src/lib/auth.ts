import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { Context } from 'hono'
import { localstore } from './store.js'
import type { AuthResponse, User, UserRecord } from '../types/domain.js'

const ACCESS_TOKEN_PREFIX = 'atk_'
const REFRESH_TOKEN_PREFIX = 'rtk_'
const REFRESH_COOKIE = 'refresh_token'

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

export async function hashPassword(password: string) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password: string, passwordHash: string) {
  return (await hashPassword(password)) === passwordHash
}

export function issueAccessToken(userId: string) {
  const token = `${ACCESS_TOKEN_PREFIX}${crypto.randomUUID()}`
  localstore.accessTokens.set(token, userId)
  return token
}

export function issueRefreshToken(userId: string, rememberMe = false) {
  const token = `${REFRESH_TOKEN_PREFIX}${crypto.randomUUID()}`
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7

  localstore.refreshSessions.set(token, {
    token,
    userId,
    expiresAt: Date.now() + maxAge * 1000,
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

export function revokeRefreshToken(token?: string | null) {
  if (!token) return
  localstore.refreshSessions.delete(token)
}

export function getUserFromAccessToken(token?: string | null): UserRecord | null {
  if (!token) return null

  const userId = localstore.accessTokens.get(token)
  if (!userId) return null

  return localstore.users.get(userId) ?? null
}

export function getBearerToken(c: Context) {
  const authorization = c.req.header('Authorization')
  if (!authorization?.startsWith('Bearer ')) return null
  return authorization.slice('Bearer '.length)
}

export function requireAuth(c: Context): UserRecord | null {
  const token = getBearerToken(c)
  const user = getUserFromAccessToken(token)
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