// Re-export all shared types from @workspace/types
export type {
  User,
  Agent,
  AgentStatus,
  Task,
  TaskStatus,
  ToolCall,
  TokenUsage,
  Message,
  AuthResponse,
  PaginatedResponse,
  LoginInput,
  RegisterInput,
  CreateAgentInput,
  UpdateAgentInput,
  TaskFilters,
} from "@workspace/types"

export {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createAgentSchema,
  updateAgentSchema,
} from "@workspace/types"

export type {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from "@workspace/types"

// ─── Web-only types ─────────────────────────────────────────────
export interface ActivityEvent {
  id: string
  type: "task_started" | "task_completed" | "task_failed" | "agent_created" | "tool_call" | "error"
  message: string
  agentId?: string
  agentName?: string
  taskId?: string
  timestamp: string
}

export interface ApiKey {
  id: string
  name: string
  maskedKey: string
  createdAt: string
  lastUsedAt?: string
}

export interface SystemHealth {
  api: "operational" | "degraded" | "down"
  latencyMs: number
  modelsAvailable: string[]
}
