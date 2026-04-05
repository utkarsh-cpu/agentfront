import type { AgentRecord, Message, Task, TokenUsage, ToolCall } from '../types/domain.js'

export interface ChatExecutionInput {
  agent: AgentRecord
  message: string
  history: Message[]
  signal?: AbortSignal
}

export interface TaskExecutionInput {
  agent: AgentRecord
  input: string
}

function estimateTokenUsage(input: string, output: string): TokenUsage {
  const prompt = Math.max(1, Math.ceil(input.length / 4))
  const completion = Math.max(1, Math.ceil(output.length / 4))

  return {
    prompt,
    completion,
    total: prompt + completion,
  }
}

export async function* streamAgentReply({ agent, message, history, signal }: ChatExecutionInput) {
  const reply = [
    `${agent.name} received your message.`,
    `Input: ${message}`,
    `Conversation messages: ${history.length}`,
  ].join(' ')

  const chunks = reply.split(' ')

  for (const chunk of chunks) {
    if (signal?.aborted) {
      break
    }

    yield `${chunk} `
    await new Promise((resolve) => setTimeout(resolve, 20))
  }
}

export async function runAgentTaskExecution({ agent, input }: TaskExecutionInput): Promise<Pick<Task, 'status' | 'output' | 'toolCalls' | 'tokenUsage'>> {
  const output = [
    `${agent.name} completed the requested task.`,
    `Input: ${input}`,
  ].join(' ')

  const toolCalls: ToolCall[] = []

  return {
    status: 'completed',
    output,
    toolCalls,
    tokenUsage: estimateTokenUsage(input, output),
  }
}