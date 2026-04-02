export function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 border border-terminal/20 bg-card px-4 py-3">
        <div className="flex gap-1">
          <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-terminal" style={{ animationDelay: "0ms" }} />
          <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-terminal" style={{ animationDelay: "300ms" }} />
          <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-terminal" style={{ animationDelay: "600ms" }} />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">Agent is thinking...</span>
      </div>
    </div>
  )
}
