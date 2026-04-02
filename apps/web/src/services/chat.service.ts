import { http } from '@/lib/http'
import { streamSSE } from '@/lib/stream'
import type { Message } from '@/types'

export const chatService = {
  sendMessage(
    agentId: string,
    message: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    return streamSSE(
      `/agents/${agentId}/chat`,
      { message },
      onChunk,
      signal
    )
  },

  getConversationHistory(agentId: string, signal?: AbortSignal): Promise<Message[]> {
    return http.get<Message[]>(`/agents/${agentId}/chat/history`, { signal })
  },

  clearHistory(agentId: string): Promise<void> {
    return http.delete<void>(`/agents/${agentId}/chat/history`)
  },
}
