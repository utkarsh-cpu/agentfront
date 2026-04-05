import { useEffect, useMemo, useState } from "react"
import { Warning } from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useAbortController } from "@/hooks/useAbortController"
import { buildActivityEvents } from "@/lib/activity"
import { agentsService } from "@/services/agents.service"
import { tasksService } from "@/services/tasks.service"
import type { Agent, Task } from "@/types"

export function HistoryPage() {
  const { getSignal } = useAbortController()
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)

    Promise.all([
      agentsService.getAgents(getSignal()),
      tasksService.getTasks({ page: 1, pageSize: 100 }, getSignal()),
    ])
      .then(([agentData, taskData]) => {
        setAgents(agentData)
        setTasks(taskData.data)
      })
      .catch((error: Error) => {
        if (error.name === "AbortError") return
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [getSignal])

  const events = useMemo(() => buildActivityEvents(tasks, agents), [tasks, agents])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">History</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">Activity log across all agents and tasks</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-mono text-xs uppercase tracking-wider">All Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : hasError ? (
            <EmptyState
              icon={<Warning weight="duotone" />}
              title="History Unavailable"
              description="Activity history could not be loaded from the API."
            />
          ) : (
            <RecentActivityFeed events={events} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
