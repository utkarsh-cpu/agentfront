import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { StatsGrid } from "@/components/dashboard/StatsGrid"
import { ActiveAgentsList } from "@/components/dashboard/ActiveAgentsList"
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed"
import { QuickStartCard } from "@/components/dashboard/QuickStartCard"
import { SystemHealthBar } from "@/components/dashboard/SystemHealthBar"
import { useAgentStore } from "@/stores/agent.store"

export function DashboardPage() {
  const agents = useAgentStore((s) => s.agents)
  const showQuickStart = agents.length === 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">System overview and agent activity</p>
      </div>

      <SystemHealthBar />
      <StatsGrid />

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
            <RecentActivityFeed />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
