import { useEffect, useState } from "react"
import { Robot, ListChecks, Lightning, ChartLine } from "@phosphor-icons/react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  suffix?: string
  delay: number
}

function AnimatedNumber({ target, duration = 1000 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const steps = 30
    const increment = target / steps
    const interval = duration / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      setCurrent(Math.min(Math.round(increment * step), target))
      if (step >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [target, duration])
  return <>{current.toLocaleString()}</>
}

function StatCard({ label, value, icon, suffix, delay }: StatCardProps) {
  return (
    <Card className={cn("animate-fade-in-up opacity-0 border-border/50 bg-card", `stagger-${delay}`)}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-terminal/30 bg-terminal/5 text-terminal">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            {label}
          </p>
          <p className="font-heading text-2xl font-bold tracking-tight text-foreground">
            <AnimatedNumber target={value} />
            {suffix && <span className="ml-0.5 text-sm text-muted-foreground">{suffix}</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsGridProps {
  activeAgents?: number
  tasksToday?: number
  tokensUsed?: number
  successRate?: number
}

export function StatsGrid({
  activeAgents = 0,
  tasksToday = 0,
  tokensUsed = 0,
  successRate = 0,
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Active Agents" value={activeAgents} icon={<Robot className="size-5" weight="duotone" />} delay={1} />
      <StatCard label="Tasks Today" value={tasksToday} icon={<ListChecks className="size-5" weight="duotone" />} delay={2} />
      <StatCard label="Tokens Used" value={tokensUsed} icon={<Lightning className="size-5" weight="duotone" />} delay={3} />
      <StatCard label="Success Rate" value={successRate} suffix="%" icon={<ChartLine className="size-5" weight="duotone" />} delay={4} />
    </div>
  )
}
