import { http } from '@/lib/http'
import type { Task, TaskFilters, PaginatedResponse } from '@/types'

export const tasksService = {
  getTasks(filters?: TaskFilters, signal?: AbortSignal): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams()
    if (filters?.status) params.set('status', filters.status)
    if (filters?.agentId) params.set('agentId', filters.agentId)
    if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters?.dateTo) params.set('dateTo', filters.dateTo)
    if (filters?.page) params.set('page', String(filters.page))
    if (filters?.pageSize) params.set('pageSize', String(filters.pageSize))

    const query = params.toString()
    return http.get<PaginatedResponse<Task>>(`/tasks${query ? `?${query}` : ''}`, { signal })
  },

  getTask(id: string, signal?: AbortSignal): Promise<Task> {
    return http.get<Task>(`/tasks/${id}`, { signal })
  },

  cancelTask(id: string): Promise<void> {
    return http.post<void>(`/tasks/${id}/cancel`)
  },
}
