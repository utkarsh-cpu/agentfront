export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: string
}

export type AgentStatus = 'idle' | 'running' | 'paused' | 'error'
export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface Agent {
  id: string
  name: string
  description: string
  model: string
  systemPrompt: string
  tools: string[]
  status: AgentStatus
  createdAt: string
  updatedAt: string
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  output: unknown
  durationMs: number
}

export interface TokenUsage {
  prompt: number
  completion: number
  total: number
}

export interface Task {
  id: string
  agentId: string
  agentName?: string
  status: TaskStatus
  input: string
  output?: string
  toolCalls: ToolCall[]
  tokenUsage: TokenUsage
  startedAt: string
  completedAt?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  toolCalls?: ToolCall[]
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface LoginInput {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface CreateAgentInput {
  name: string
  description: string
  model: string
  systemPrompt: string
  tools: string[]
  temperature?: number
  maxTokens?: number
}

export interface UpdateAgentInput extends Partial<CreateAgentInput> {}

export interface TaskFilters {
  status?: TaskStatus
  agentId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export interface UserRecord extends User {
  passwordHash: string
}

export interface AgentRecord extends Agent {
  userId: string
  temperature?: number
  maxTokens?: number
}

export interface TaskRecord extends Task {
  userId: string
}

export interface RefreshSession {
  token: string
  userId: string
  expiresAt: number
}

export interface PasswordResetRecord {
  token: string
  userId: string
  expiresAt: number
  usedAt?: number
}