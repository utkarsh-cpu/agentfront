import { http } from '@/lib/http'
import type { Agent, CreateAgentInput, UpdateAgentInput, Task } from '@/types'

export const agentsService = {
  getAgents(signal?: AbortSignal): Promise<Agent[]> {
    return http.get<Agent[]>('/agents', { signal })
  },

  getAgent(id: string, signal?: AbortSignal): Promise<Agent> {
    return http.get<Agent>(`/agents/${id}`, { signal })
  },

  createAgent(data: CreateAgentInput): Promise<Agent> {
    return http.post<Agent>('/agents', data)
  },

  updateAgent(id: string, data: UpdateAgentInput): Promise<Agent> {
    return http.patch<Agent>(`/agents/${id}`, data)
  },

  deleteAgent(id: string): Promise<void> {
    return http.delete<void>(`/agents/${id}`)
  },

  runAgent(id: string, input: string): Promise<Task> {
    return http.post<Task>(`/agents/${id}/run`, { input })
  },
}
