import { cn } from "@workspace/ui/lib/utils"

const sizeClasses = {
  sm: "size-4 border",
  md: "size-6 border-2",
  lg: "size-10 border-2",
} as const

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-spin rounded-full border-terminal/30 border-t-terminal",
        sizeClasses[size],
        className,
      )}
    />
  )
}

export function FullPageLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <span className="animate-pulse font-mono text-xs tracking-widest text-terminal-muted uppercase">
          Loading…
        </span>
      </div>
    </div>
  )
}
