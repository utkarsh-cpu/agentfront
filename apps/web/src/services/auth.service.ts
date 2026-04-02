import { http } from '@/lib/http'
import type { AuthResponse, LoginInput, RegisterInput } from '@/types'

export const authService = {
  login(credentials: LoginInput): Promise<AuthResponse> {
    return http.post<AuthResponse>('/auth/login', credentials)
  },

  register(data: RegisterInput): Promise<AuthResponse> {
    return http.post<AuthResponse>('/auth/register', data)
  },

  logout(): Promise<void> {
    return http.post<void>('/auth/logout')
  },

  refreshToken(): Promise<AuthResponse> {
    return http.post<AuthResponse>('/auth/refresh')
  },

  forgotPassword(email: string): Promise<void> {
    return http.post<void>('/auth/forgot-password', { email })
  },

  resetPassword(token: string, password: string): Promise<void> {
    return http.post<void>('/auth/reset-password', { token, password })
  },
}
