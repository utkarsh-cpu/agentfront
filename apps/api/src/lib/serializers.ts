import type {
  Agent as PrismaAgent,
  Message as PrismaMessage,
  Task as PrismaTask,
  User as PrismaUser,
} from '@prisma/client'
import type {
  Agent,
  AgentRecord,
  Message,
  Task,
  TaskRecord,
  TokenUsage,
  ToolCall,
  UserRecord,
} from '../types/domain.js'

const emptyTokenUsage: TokenUsage = {
  prompt: 0,
  completion: 0,
  total: 0,
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function serializeStringArray(value: string[]) {
  return JSON.stringify(value)
}

export function serializeToolCalls(value: ToolCall[] | undefined) {
  return JSON.stringify(value ?? [])
}

export function serializeTokenUsage(value: TokenUsage) {
  return JSON.stringify(value)
}

export function toUserRecord(user: PrismaUser): UserRecord {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl ?? undefined,
    createdAt: user.createdAt.toISOString(),
    passwordHash: user.passwordHash,
  }
}

export function toAgentRecord(agent: PrismaAgent): AgentRecord {
  return {
    id: agent.id,
    userId: agent.userId,
    name: agent.name,
    description: agent.description,
    model: agent.modelName,
    systemPrompt: agent.systemPrompt,
    tools: parseJson(agent.toolsJson, [] as string[]),
    status: agent.status as AgentRecord['status'],
    createdAt: agent.createdAt.toISOString(),
    updatedAt: agent.updatedAt.toISOString(),
    temperature: agent.temperature ?? undefined,
    maxTokens: agent.maxTokens ?? undefined,
  }
}

export function toPublicAgent(agent: PrismaAgent): Agent {
  const { userId, temperature, maxTokens, ...publicAgent } = toAgentRecord(agent)
  void userId
  void temperature
  void maxTokens
  return publicAgent
}

export function toDomainMessage(message: PrismaMessage): Message {
  const toolCalls = parseJson(message.toolCallsJson, [] as ToolCall[])

  return {
    id: message.id,
    role: message.role as Message['role'],
    content: message.content,
    ...(toolCalls.length > 0 ? { toolCalls } : {}),
    createdAt: message.createdAt.toISOString(),
  }
}

export function toTaskRecord(task: PrismaTask): TaskRecord {
  return {
    id: task.id,
    userId: task.userId,
    agentId: task.agentId,
    agentName: task.agentName ?? undefined,
    status: task.status as TaskRecord['status'],
    input: task.input,
    output: task.output ?? undefined,
    toolCalls: parseJson(task.toolCallsJson, [] as ToolCall[]),
    tokenUsage: parseJson(task.tokenUsageJson, emptyTokenUsage),
    startedAt: task.startedAt.toISOString(),
    completedAt: task.completedAt?.toISOString(),
  }
}

export function toPublicTask(task: PrismaTask): Task {
  const { userId, ...publicTask } = toTaskRecord(task)
  void userId
  return publicTask
}