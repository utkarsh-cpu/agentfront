import type { TokenUsage } from "@/types"
import { cn } from "@workspace/ui/lib/utils"

interface TokenCounterProps {
  usage: TokenUsage
  className?: string
}

function getUsageLevel(total: number): "low" | "medium" | "high" {
  if (total < 1000) return "low"
  if (total < 4000) return "medium"
  return "high"
}

const levelStyles = {
  low: "border-terminal/30 bg-terminal/5 text-terminal",
  medium: "border-yellow-500/30 bg-yellow-500/5 text-yellow-500",
  high: "border-destructive/30 bg-destructive/5 text-destructive",
} as const

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function TokenCounter({ usage, className }: TokenCounterProps) {
  const level = getUsageLevel(usage.total)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] tracking-wider",
        levelStyles[level],
        className,
      )}
    >
      <span className="opacity-60">tokens</span>
      <span className="font-medium">{formatCount(usage.total)}</span>
      <span className="text-muted-foreground opacity-40">|</span>
      <span className="opacity-60">
        ↑{formatCount(usage.prompt)} ↓{formatCount(usage.completion)}
      </span>
    </span>
  )
}
