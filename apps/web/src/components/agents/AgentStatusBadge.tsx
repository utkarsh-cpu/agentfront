import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import type { AgentStatus } from "@/types"

const statusConfig: Record<AgentStatus, { label: string; className: string; pulse?: boolean }> = {
  idle: { label: "Idle", className: "border-muted-foreground/30 text-muted-foreground bg-muted/10" },
  running: { label: "Running", className: "border-terminal/40 text-terminal bg-terminal/10", pulse: true },
  paused: { label: "Paused", className: "border-yellow-500/40 text-yellow-500 bg-yellow-500/10" },
  error: { label: "Error", className: "border-destructive/40 text-destructive bg-destructive/10" },
}

interface AgentStatusBadgeProps {
  status: AgentStatus
  className?: string
}

export function AgentStatusBadge({ status, className }: AgentStatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn("gap-1.5 rounded-none text-[10px] font-medium", config.className, className)}>
      <span className={cn("inline-block h-1.5 w-1.5 rounded-full bg-current", config.pulse && "animate-pulse-dot")} />
      {config.label}
    </Badge>
  )
}
