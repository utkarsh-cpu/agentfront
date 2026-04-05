import { create } from 'zustand'
import type { Conversation, ChatMessage } from '@/types'

interface ConversationState {
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: ChatMessage[]
  isStreaming: boolean
  streamingContent: string
  isLoading: boolean

  setConversations: (convs: Conversation[]) => void
  setActiveConversation: (conv: Conversation | null) => void
  addConversation: (conv: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  removeConversation: (id: string) => void
  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  appendToStreaming: (chunk: string) => void
  finalizeStreaming: (message: ChatMessage) => void
  setStreaming: (streaming: boolean) => void
  setLoading: (loading: boolean) => void
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  isLoading: false,

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (activeConversation) => set({ activeConversation }),
  addConversation: (conv) =>
    set((s) => ({ conversations: [conv, ...s.conversations] })),
  updateConversation: (id, updates) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
      activeConversation:
        s.activeConversation?.id === id
          ? { ...s.activeConversation, ...updates }
          : s.activeConversation,
    })),
  removeConversation: (id) =>
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== id),
      activeConversation:
        s.activeConversation?.id === id ? null : s.activeConversation,
    })),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),
  appendToStreaming: (chunk) =>
    set((s) => ({ streamingContent: s.streamingContent + chunk })),
  finalizeStreaming: (message) =>
    set((s) => ({
      messages: [...s.messages, message],
      streamingContent: '',
      isStreaming: false,
    })),
  setStreaming: (isStreaming) => set({ isStreaming, streamingContent: '' }),
  setLoading: (isLoading) => set({ isLoading }),
}))
