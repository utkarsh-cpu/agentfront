import { cn } from "@workspace/ui/lib/utils"
import type { SystemHealth } from "@/types"

const statusStyles = {
  operational: "bg-terminal",
  degraded: "bg-yellow-400",
  down: "bg-destructive",
}

interface SystemHealthBarProps {
  health?: SystemHealth
}

const defaultHealth: SystemHealth = {
  api: "operational",
  latencyMs: 42,
  modelsAvailable: ["gpt-4o", "gpt-4o-mini", "claude-3.5-sonnet"],
}

export function SystemHealthBar({ health = defaultHealth }: SystemHealthBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 border border-border/50 bg-card px-4 py-2.5 font-mono text-[10px] tracking-wider">
      <div className="flex items-center gap-2">
        <span className={cn("h-1.5 w-1.5 rounded-full", statusStyles[health.api])} />
        <span className="text-muted-foreground uppercase">API:</span>
        <span className={cn(
          health.api === "operational" ? "text-terminal" : health.api === "degraded" ? "text-yellow-400" : "text-destructive"
        )}>
          {health.api}
        </span>
      </div>
      <span className="text-border">|</span>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground uppercase">Latency:</span>
        <span className="text-foreground">{health.latencyMs}ms</span>
      </div>
      <span className="text-border">|</span>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground uppercase">Models:</span>
        <span className="text-foreground">{health.modelsAvailable.length} available</span>
      </div>
    </div>
  )
}
