import { Navigate } from "react-router-dom"
import { useAgentStore } from "@/stores/agent.store"

export function ChatRedirectPage() {
  const lastAgentId = useAgentStore((s) => s.lastAgentId)

  if (lastAgentId) {
    return <Navigate to={`/agents/${lastAgentId}/chat`} replace />
  }

  return <Navigate to="/agents" replace />
}
