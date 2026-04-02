import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer"

interface StreamingMessageProps {
  content: string
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] border border-terminal/20 bg-card px-4 py-3">
        <div className="mb-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          assistant
        </div>
        <MarkdownRenderer content={content} />
        <span className="animate-blink-cursor inline-block h-4 w-1.5 bg-terminal" />
      </div>
    </div>
  )
}
