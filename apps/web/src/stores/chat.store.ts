import { create } from 'zustand'
import type { Message } from '@/types'

interface ChatState {
  messages: Message[]
  isStreaming: boolean
  activeConversationAgentId: string | null
  streamingContent: string
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  appendToStreaming: (chunk: string) => void
  finalizeStreaming: (message: Message) => void
  clearStreaming: () => void
  setStreaming: (streaming: boolean) => void
  setActiveConversation: (agentId: string | null) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  activeConversationAgentId: null,
  streamingContent: '',

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  appendToStreaming: (chunk) =>
    set((s) => ({ streamingContent: s.streamingContent + chunk })),
  finalizeStreaming: (message) =>
    set((s) => ({
      messages: [...s.messages, message],
      streamingContent: '',
      isStreaming: false,
    })),
  clearStreaming: () => set({ streamingContent: '', isStreaming: false }),
  setStreaming: (isStreaming) => set({ isStreaming, streamingContent: '' }),
  setActiveConversation: (agentId) =>
    set({ activeConversationAgentId: agentId, messages: [], streamingContent: '' }),
  clearMessages: () => set({ messages: [], streamingContent: '' }),
}))
