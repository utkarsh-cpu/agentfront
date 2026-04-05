import { useEffect, useMemo, useState } from "react"
import { Warning } from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { StatsGrid } from "@/components/dashboard/StatsGrid"
import { ActiveAgentsList } from "@/components/dashboard/ActiveAgentsList"
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed"
import { QuickStartCard } from "@/components/dashboard/QuickStartCard"
import { SystemHealthBar } from "@/components/dashboard/SystemHealthBar"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useAbortController } from "@/hooks/useAbortController"
import { buildActivityEvents, buildSystemHealth } from "@/lib/activity"
import { agentsService } from "@/services/agents.service"
import { tasksService } from "@/services/tasks.service"
import { useAgentStore } from "@/stores/agent.store"
import type { Task } from "@/types"

export function DashboardPage() {
  const agents = useAgentStore((s) => s.agents)
  const setAgents = useAgentStore((s) => s.setAgents)
  const { getSignal } = useAbortController()
  const [tasks, setTasks] = useState<Task[]>([])
  const [latencyMs, setLatencyMs] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const showQuickStart = agents.length === 0

  useEffect(() => {
    const startedAt = performance.now()
    setIsLoading(true)
    setHasError(false)

    Promise.all([
      agentsService.getAgents(getSignal()),
      tasksService.getTasks({ page: 1, pageSize: 100 }, getSignal()),
    ])
      .then(([agentData, taskData]) => {
        setAgents(agentData)
        setTasks(taskData.data)
        setLatencyMs(Math.round(performance.now() - startedAt))
      })
      .catch((error: Error) => {
        if (error.name === "AbortError") return
        setHasError(true)
        setLatencyMs(Math.round(performance.now() - startedAt))
      })
      .finally(() => setIsLoading(false))
  }, [getSignal, setAgents])

  const stats = useMemo(() => {
    const activeAgents = agents.filter((agent) => agent.status === "running").length
    const today = new Date()
    const tasksToday = tasks.filter((task) => {
      const started = new Date(task.startedAt)
      return started.toDateString() === today.toDateString()
    }).length
    const tokensUsed = tasks.reduce((total, task) => total + task.tokenUsage.total, 0)
    const completedTasks = tasks.filter((task) => task.status === "completed" || task.status === "failed")
    const successfulTasks = completedTasks.filter((task) => task.status === "completed").length

    return {
      activeAgents,
      tasksToday,
      tokensUsed,
      successRate: completedTasks.length === 0 ? 0 : Math.round((successfulTasks / completedTasks.length) * 100),
    }
  }, [agents, tasks])

  const events = useMemo(() => buildActivityEvents(tasks, agents).slice(0, 10), [tasks, agents])
  const health = useMemo(() => buildSystemHealth(agents, latencyMs, hasError), [agents, latencyMs, hasError])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">System overview and agent activity</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="lg" />
        </div>
      ) : hasError ? (
        <EmptyState
          icon={<Warning weight="duotone" />}
          title="Dashboard Unavailable"
          description="Live dashboard data could not be loaded from the API."
        />
      ) : (
        <>
          <SystemHealthBar health={health} />
          <StatsGrid
            activeAgents={stats.activeAgents}
            tasksToday={stats.tasksToday}
            tokensUsed={stats.tokensUsed}
            successRate={stats.successRate}
          />
        </>
      )}

      {showQuickStart && <QuickStartCard />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-sm font-semibold tracking-wide uppercase">
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActiveAgentsList />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-sm font-semibold tracking-wide uppercase">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityFeed events={events} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
