import { useNavigate } from "react-router-dom"
import { Chat, Eye, Trash } from "@phosphor-icons/react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import type { Agent } from "@/types"
import { AgentStatusBadge } from "./AgentStatusBadge"
import { RelativeTime } from "@/components/shared/RelativeTime"

interface AgentCardProps {
  agent: Agent
  onDelete?: (id: string) => void
}

export function AgentCard({ agent, onDelete }: AgentCardProps) {
  const navigate = useNavigate()

  return (
    <Card className="group border-border/50 transition-colors hover:border-terminal/30">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-sm font-semibold">{agent.name}</h3>
            <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{agent.model}</p>
          </div>
          <AgentStatusBadge status={agent.status} />
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {agent.description || "No description"}
        </p>

        <div className="flex items-center justify-between border-t border-border/30 pt-3">
          <RelativeTime date={agent.updatedAt} className="text-[10px]" />
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon-xs" onClick={() => navigate(`/agents/${agent.id}/chat`)} className="text-muted-foreground hover:text-terminal">
              <Chat className="size-3.5" weight="duotone" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={() => navigate(`/agents/${agent.id}`)} className="text-muted-foreground hover:text-foreground">
              <Eye className="size-3.5" weight="duotone" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={() => onDelete?.(agent.id)} className="text-muted-foreground hover:text-destructive">
              <Trash className="size-3.5" weight="duotone" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
