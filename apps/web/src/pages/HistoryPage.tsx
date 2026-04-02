import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed"

export function HistoryPage() {
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
          <RecentActivityFeed />
        </CardContent>
      </Card>
    </div>
  )
}
