import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"

interface TaskProgressBarProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function TaskProgressBar({ steps, currentStep, className }: TaskProgressBarProps) {
  const progress = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 100

  return (
    <div className={cn("space-y-2", className)}>
      <Progress value={progress} className="h-1.5 rounded-none [&>div]:bg-terminal" />
      <div className="flex justify-between">
        {steps.map((step, i) => (
          <span
            key={step}
            className={cn(
              "font-mono text-[10px] tracking-wider uppercase",
              i <= currentStep ? "text-terminal" : "text-muted-foreground/50"
            )}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  )
}
