import type { Message } from "@/types"
import { cn } from "@workspace/ui/lib/utils"
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer"
import { ToolCallBlock } from "./ToolCallBlock"

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[85%] border px-4 py-3",
        isUser
          ? "border-border/50 bg-muted/30 text-foreground"
          : "border-terminal/20 bg-card text-foreground"
      )}>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          {isUser ? "you" : "assistant"}
        </div>
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.toolCalls.map((tc) => (
              <ToolCallBlock key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
