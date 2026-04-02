import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

interface EmptyStateAction {
  label: string
  onClick: () => void
}

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: EmptyStateAction
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 border border-border/50 bg-muted/5 p-12 text-center font-mono",
        className,
      )}
    >
      <div className="text-terminal-muted [&_svg]:size-10">{icon}</div>
      <div className="space-y-1.5">
        <h3 className="font-sans text-sm font-medium tracking-wide text-foreground uppercase">
          {title}
        </h3>
        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
