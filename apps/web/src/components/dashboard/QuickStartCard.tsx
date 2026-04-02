import { useNavigate } from "react-router-dom"
import { RocketLaunch } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

export function QuickStartCard() {
  const navigate = useNavigate()

  return (
    <Card className="border-terminal/30 bg-terminal/5">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-terminal/30 bg-terminal/10 text-terminal">
          <RocketLaunch className="size-6" weight="duotone" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-sm font-semibold tracking-wide text-foreground uppercase">
            Get Started
          </h3>
          <p className="mt-1 font-mono text-xs leading-relaxed text-muted-foreground">
            Create your first AI agent to start automating tasks. Configure a model, system prompt, and tools.
          </p>
        </div>
        <Button
          onClick={() => navigate("/agents/new")}
          className="shrink-0 bg-terminal text-black hover:bg-terminal/80"
        >
          Create Agent
        </Button>
      </CardContent>
    </Card>
  )
}
