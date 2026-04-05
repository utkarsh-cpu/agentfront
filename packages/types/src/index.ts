import { z } from "zod"

// ─── Status enums ────────────────────────────────────────────────
export type AgentStatus = "idle" | "running" | "paused" | "error"
export type TaskStatus = "queued" | "running" | "completed" | "failed" | "cancelled"

// ─── Core domain types ──────────────────────────────────────────
export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: string
}

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
  role: "user" | "assistant" | "system"
  content: string
  toolCalls?: ToolCall[]
  createdAt: string
}

// ─── Auth types ─────────────────────────────────────────────────
export interface AuthResponse {
  user: User
  token: string
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

// ─── API types ──────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
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

// ─── Server-only record types ───────────────────────────────────
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

// ─── Zod schemas (shared validation) ────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1).optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.confirmPassword === undefined) return true
      return data.password === data.confirmPassword
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  )

export const createAgentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(1, "Description is required"),
  model: z.string().min(1, "Model is required"),
  systemPrompt: z.string().min(1, "System prompt is required"),
  tools: z.array(z.string()),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
})

export const updateAgentSchema = createAgentSchema.partial()

export const runAgentSchema = z.object({
  input: z.string().min(1, "Input is required"),
})

export const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
})

// ─── Inferred form types ────────────────────────────────────────
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// ─── Conversation types ─────────────────────────────────────────
export interface Conversation {
  id: string
  title: string
  modelName: string
  systemPrompt?: string
  tools: string[]
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  toolCalls?: ToolCall[]
  createdAt: string
}

export interface CreateConversationInput {
  modelName: string
  tools?: string[]
  systemPrompt?: string
}

export interface UpdateConversationInput {
  title?: string
  modelName?: string
  tools?: string[]
  systemPrompt?: string
}

// ─── Conversation Zod schemas ───────────────────────────────────
export const createConversationSchema = z.object({
  modelName: z.string().min(1),
  tools: z.array(z.string()).optional(),
  systemPrompt: z.string().optional(),
})

export const updateConversationSchema = createConversationSchema.partial().extend({
  title: z.string().optional(),
})

export const chatMessageSchema = z.object({
  message: z.string().min(1),
})
