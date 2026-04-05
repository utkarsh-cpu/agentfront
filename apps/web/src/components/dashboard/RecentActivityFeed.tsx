import {
  CheckCircle,
  XCircle,
  Play,
  Robot,
  Wrench,
  Warning,
} from "@phosphor-icons/react"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"
import type { ActivityEvent } from "@/types"
import { RelativeTime } from "@/components/shared/RelativeTime"
import { EmptyState } from "@/components/shared/EmptyState"

const iconMap: Record<ActivityEvent["type"], { icon: React.ElementType; color: string }> = {
  task_started: { icon: Play, color: "text-blue-400" },
  task_completed: { icon: CheckCircle, color: "text-terminal" },
  task_failed: { icon: XCircle, color: "text-destructive" },
  agent_created: { icon: Robot, color: "text-terminal" },
  tool_call: { icon: Wrench, color: "text-yellow-400" },
  error: { icon: Warning, color: "text-destructive" },
}

interface RecentActivityFeedProps {
  events?: ActivityEvent[]
}

export function RecentActivityFeed({ events = [] }: RecentActivityFeedProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={<Warning weight="duotone" />}
        title="No Activity Yet"
        description="Recent task and agent activity will appear here once the system has real events to show."
        className="h-72 border-0 bg-transparent p-6"
      />
    )
  }

  return (
    <ScrollArea className="h-72">
      <div className="space-y-1">
        {events.map((event) => {
          const { icon: Icon, color } = iconMap[event.type]
          return (
            <div
              key={event.id}
              className="flex items-start gap-3 border-b border-border/30 px-1 py-2.5 last:border-0"
            >
              <Icon className={cn("mt-0.5 size-4 shrink-0", color)} weight="duotone" />
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-relaxed text-foreground">{event.message}</p>
                {event.agentName && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    agent: {event.agentName}
                  </span>
                )}
              </div>
              <RelativeTime date={event.timestamp} className="shrink-0 text-[10px]" />
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
