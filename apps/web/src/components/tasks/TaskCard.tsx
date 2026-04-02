import type { Task } from "@/types"
import { Card, CardContent } from "@workspace/ui/components/card"
import { TaskStatusBadge } from "./TaskStatusBadge"
import { RelativeTime } from "@/components/shared/RelativeTime"

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card className="border-border/50 transition-colors hover:border-terminal/20">
      <CardContent className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between">
          <TaskStatusBadge status={task.status} />
          <RelativeTime date={task.startedAt} className="text-[10px]" />
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed">{task.input}</p>
        <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
          <span>{task.agentName ?? "—"}</span>
          <span>{task.tokenUsage.total} tokens</span>
        </div>
      </CardContent>
    </Card>
  )
}
