import type {
  AgentRecord,
  Message,
  PasswordResetRecord,
  RefreshSession,
  TaskRecord,
  UserRecord,
} from '../types/domain.js'

function conversationKey(userId: string, agentId: string) {
  return `${userId}:${agentId}`
}


export const localstore = {
  users: new Map<string, UserRecord>(),
  usersByEmail: new Map<string, string>(),
  accessTokens: new Map<string, string>(),
  refreshSessions: new Map<string, RefreshSession>(),
  passwordResets: new Map<string, PasswordResetRecord>(),
  agents: new Map<string, AgentRecord>(),
  tasks: new Map<string, TaskRecord>(),
  messages: new Map<string, Message[]>(),

  getConversation(userId: string, agentId: string) {
    const key = conversationKey(userId, agentId)
    return this.messages.get(key) ?? []
  },

  setConversation(userId: string, agentId: string, messages: Message[]) {
    const key = conversationKey(userId, agentId)
    this.messages.set(key, messages)
  },

  clearConversation(userId: string, agentId: string) {
    const key = conversationKey(userId, agentId)
    this.messages.delete(key)
  },
}