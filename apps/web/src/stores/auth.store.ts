import { create } from 'zustand'
import type { User, LoginInput, RegisterInput } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginInput) => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  setAuth: (user: User, token: string) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, token) =>
    set({ user, token, isAuthenticated: true, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  login: async (credentials) => {
    set({ isLoading: true })
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL ?? '/api'}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
          credentials: 'include',
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Login failed' }))
        throw new Error(err.message ?? 'Login failed')
      }
      const data = await res.json()
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (data) => {
    set({ isLoading: true })
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL ?? '/api'}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Registration failed' }))
        throw new Error(err.message ?? 'Registration failed')
      }
      const result = await res.json()
      set({ user: result.user, token: result.token, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      const token = get().token
      await fetch(`${import.meta.env.VITE_API_URL ?? '/api'}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      })
    } catch {
      // ignore logout errors
    } finally {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },

  refreshToken: async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL ?? '/api'}/auth/refresh`,
        {
          method: 'POST',
          credentials: 'include',
        }
      )
      if (!res.ok) {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
        return false
      }
      const data = await res.json()
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
      return true
    } catch {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
      return false
    }
  },
}))
