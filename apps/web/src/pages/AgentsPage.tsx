import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { useAgentStore } from "@/stores/agent.store"
import { useAbortController } from "@/hooks/useAbortController"
import { agentsService } from "@/services/agents.service"
import { AgentGrid } from "@/components/agents/AgentGrid"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"

export function AgentsPage() {
  const navigate = useNavigate()
  const { agents, isLoading, setAgents, setLoading, setError, removeAgent } = useAgentStore()
  const { getSignal } = useAbortController()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    agentsService
      .getAgents(getSignal())
      .then((data) => setAgents(data))
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message)
      })
  }, [getSignal, setAgents, setLoading, setError])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await agentsService.deleteAgent(deleteId)
      removeAgent(deleteId)
    } catch {
      // handle error silently
    }
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Agents</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Manage your AI agents</p>
        </div>
        <Button onClick={() => navigate("/agents/new")} className="bg-terminal text-black hover:bg-terminal/80">
          <Plus className="mr-1.5 size-4" />
          Create Agent
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <AgentGrid agents={agents} onDelete={setDeleteId} />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Agent"
        description="This action cannot be undone. The agent and all associated data will be permanently deleted."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
