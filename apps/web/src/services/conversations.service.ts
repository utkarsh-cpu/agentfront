import { http } from '@/lib/http'
import { streamSSE } from '@/lib/stream'
import type { Conversation, ChatMessage, CreateConversationInput, UpdateConversationInput } from '@/types'

export const conversationsService = {
  getConversations(signal?: AbortSignal): Promise<Conversation[]> {
    return http.get<Conversation[]>('/conversations', { signal })
  },

  getConversation(id: string, signal?: AbortSignal): Promise<Conversation & { messages: ChatMessage[] }> {
    return http.get<Conversation & { messages: ChatMessage[] }>(`/conversations/${id}`, { signal })
  },

  createConversation(data: CreateConversationInput): Promise<Conversation> {
    return http.post<Conversation>('/conversations', data)
  },

  updateConversation(id: string, data: UpdateConversationInput): Promise<Conversation> {
    return http.patch<Conversation>(`/conversations/${id}`, data)
  },

  deleteConversation(id: string): Promise<void> {
    return http.delete<void>(`/conversations/${id}`)
  },

  sendMessage(
    conversationId: string,
    message: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    return streamSSE(
      `/conversations/${conversationId}/chat`,
      { message },
      onChunk,
      signal
    )
  },

  getMessages(conversationId: string, signal?: AbortSignal): Promise<ChatMessage[]> {
    return http.get<Conversation & { messages: ChatMessage[] }>(`/conversations/${conversationId}`, { signal })
      .then((data) => data.messages)
  },
}
