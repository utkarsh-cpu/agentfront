import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Chat } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { useAgentStore } from "@/stores/agent.store"
import { useAbortController } from "@/hooks/useAbortController"
import { agentsService } from "@/services/agents.service"
import { AgentStatusBadge } from "@/components/agents/AgentStatusBadge"
import { AgentConfigPanel } from "@/components/agents/AgentConfigPanel"
import { AgentMetricsPanel } from "@/components/agents/AgentMetricsPanel"
import { AgentRunHistory } from "@/components/agents/AgentRunHistory"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { RelativeTime } from "@/components/shared/RelativeTime"

export function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const { selectedAgent, setSelectedAgent, setLoading, isLoading } = useAgentStore()
  const { getSignal } = useAbortController()

  useEffect(() => {
    if (!agentId) return
    setLoading(true)
    agentsService
      .getAgent(agentId, getSignal())
      .then((agent) => setSelectedAgent(agent))
      .catch(() => setSelectedAgent(null))
      .finally(() => setLoading(false))
  }, [agentId, getSignal, setSelectedAgent, setLoading])

  if (isLoading || !selectedAgent) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight">{selectedAgent.name}</h1>
            <AgentStatusBadge status={selectedAgent.status} />
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{selectedAgent.description}</p>
          <div className="mt-2 flex gap-4 font-mono text-[10px] text-muted-foreground">
            <span>Model: {selectedAgent.model}</span>
            <span>Created: <RelativeTime date={selectedAgent.createdAt} /></span>
          </div>
        </div>
        <Button onClick={() => navigate(`/agents/${agentId}/chat`)} className="bg-terminal text-black hover:bg-terminal/80">
          <Chat className="mr-1.5 size-4" />
          Chat
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="border-b border-border bg-transparent rounded-none">
          <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-terminal data-[state=active]:text-terminal">Overview</TabsTrigger>
          <TabsTrigger value="config" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-terminal data-[state=active]:text-terminal">Config</TabsTrigger>
          <TabsTrigger value="metrics" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-terminal data-[state=active]:text-terminal">Metrics</TabsTrigger>
          <TabsTrigger value="history" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-terminal data-[state=active]:text-terminal">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-mono text-xs uppercase tracking-wider">System Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
                {selectedAgent.systemPrompt || "No system prompt configured."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <AgentConfigPanel agent={selectedAgent} />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <AgentMetricsPanel />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <AgentRunHistory tasks={[]} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
