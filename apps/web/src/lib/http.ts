import { useAuthStore } from '@/stores/auth.store'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    message?: string
  ) {
    super(message ?? `HTTP Error ${status}`)
  }
}

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, signal } = options

  const token = useAuthStore.getState().token

  const response = await fetch(`${API_BASE}${url}`, {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    credentials: 'include',
  })

  if (response.status === 401) {
    const refreshed = await useAuthStore.getState().refreshToken()
    if (refreshed) {
      return request<T>(url, options)
    } else {
      useAuthStore.getState().logout()
      throw new HttpError(401, null, 'Session expired')
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new HttpError(response.status, data)
  }

  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}

export const http = {
  get: <T>(url: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...opts, method: 'GET' }),

  post: <T>(url: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(url, { ...opts, method: 'POST', body }),

  put: <T>(url: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(url, { ...opts, method: 'PUT', body }),

  patch: <T>(url: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(url, { ...opts, method: 'PATCH', body }),

  delete: <T>(url: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...opts, method: 'DELETE' }),
}
