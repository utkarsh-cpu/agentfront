import { Robot, Stop } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"
import { useAgentStore } from "@/stores/agent.store"
import { EmptyState } from "@/components/shared/EmptyState"

export function ActiveAgentsList() {
  const agents = useAgentStore((s) => s.agents)
  const runningAgents = agents.filter((a) => a.status === "running")

  if (runningAgents.length === 0) {
    return (
      <EmptyState
        icon={<Robot weight="duotone" />}
        title="No Active Agents"
        description="All agents are currently idle. Start a task to see agents in action."
      />
    )
  }

  return (
    <ScrollArea className="h-64">
      <div className="space-y-2">
        {runningAgents.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center gap-3 border border-border/50 bg-card p-3 transition-colors hover:bg-muted/20"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terminal opacity-75" />
              <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full bg-terminal")} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{agent.name}</p>
              <p className="truncate font-mono text-[10px] text-muted-foreground">
                {agent.model} — processing task...
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 border-terminal/30 text-terminal text-[10px]">
              running
            </Badge>
            <Button variant="ghost" size="icon-xs" className="shrink-0 text-muted-foreground hover:text-destructive">
              <Stop className="size-3.5" weight="fill" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
