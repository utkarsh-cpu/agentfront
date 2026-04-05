import type { ActivityEvent, Agent, SystemHealth, Task } from "@/types"

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1)}…`
}

function createTaskEvent(task: Task): ActivityEvent | null {
  const agentLabel = task.agentName ?? task.agentId
  const taskInput = truncate(task.input.trim(), 80)

  switch (task.status) {
    case "queued":
    case "running":
      return {
        id: `task-${task.id}`,
        type: "task_started",
        message: `Task started for ${agentLabel}: ${taskInput}`,
        agentId: task.agentId,
        agentName: task.agentName,
        taskId: task.id,
        timestamp: task.startedAt,
      }
    case "completed":
      return {
        id: `task-${task.id}`,
        type: "task_completed",
        message: `Task completed for ${agentLabel}: ${taskInput}`,
        agentId: task.agentId,
        agentName: task.agentName,
        taskId: task.id,
        timestamp: task.completedAt ?? task.startedAt,
      }
    case "failed":
      return {
        id: `task-${task.id}`,
        type: "task_failed",
        message: `Task failed for ${agentLabel}: ${truncate(task.output ?? taskInput, 80)}`,
        agentId: task.agentId,
        agentName: task.agentName,
        taskId: task.id,
        timestamp: task.completedAt ?? task.startedAt,
      }
    case "cancelled":
      return {
        id: `task-${task.id}`,
        type: "error",
        message: `Task cancelled for ${agentLabel}: ${taskInput}`,
        agentId: task.agentId,
        agentName: task.agentName,
        taskId: task.id,
        timestamp: task.completedAt ?? task.startedAt,
      }
    default:
      return null
  }
}

function createAgentEvent(agent: Agent): ActivityEvent {
  return {
    id: `agent-${agent.id}`,
    type: "agent_created",
    message: `Agent created: ${agent.name}`,
    agentId: agent.id,
    agentName: agent.name,
    timestamp: agent.createdAt,
  }
}

export function buildActivityEvents(tasks: Task[], agents: Agent[]): ActivityEvent[] {
  return [
    ...tasks.map(createTaskEvent).filter((event): event is ActivityEvent => event !== null),
    ...agents.map(createAgentEvent),
  ].sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
}

export function buildSystemHealth(agents: Agent[], latencyMs: number, hasError: boolean): SystemHealth {
  const modelsAvailable = Array.from(new Set(agents.map((agent) => agent.model).filter(Boolean)))

  return {
    api: hasError ? "down" : latencyMs > 1500 ? "degraded" : "operational",
    latencyMs,
    modelsAvailable,
  }
}