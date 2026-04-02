import { Robot } from "@phosphor-icons/react"
import { useNavigate } from "react-router-dom"
import type { Agent } from "@/types"
import { AgentCard } from "./AgentCard"
import { EmptyState } from "@/components/shared/EmptyState"

interface AgentGridProps {
  agents: Agent[]
  onDelete?: (id: string) => void
}

export function AgentGrid({ agents, onDelete }: AgentGridProps) {
  const navigate = useNavigate()

  if (agents.length === 0) {
    return (
      <EmptyState
        icon={<Robot weight="duotone" />}
        title="No Agents"
        description="Create your first AI agent to get started."
        action={{ label: "Create Agent", onClick: () => navigate("/agents/new") }}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} onDelete={onDelete} />
      ))}
    </div>
  )
}
