import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Trash, Export } from "@phosphor-icons/react"
import { useChatStore } from "@/stores/chat.store"
import { chatService } from "@/services/chat.service"
import { TokenCounter } from "@/components/shared/TokenCounter"

interface ChatToolbarProps {
  agentId: string
}

export function ChatToolbar({ agentId }: ChatToolbarProps) {
  const messages = useChatStore((s) => s.messages)
  const clearMessages = useChatStore((s) => s.clearMessages)

  const totalTokens = messages.length * 50 // rough estimate

  const handleClear = async () => {
    await chatService.clearHistory(agentId).catch(() => {})
    clearMessages()
  }

  const handleExport = () => {
    const text = messages.map((m) => `[${m.role}]: ${m.content}`).join("\n\n")
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-${agentId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-2">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="rounded-none text-[10px] border-terminal/30 text-terminal">
          agent:{agentId.slice(0, 8)}
        </Badge>
        <TokenCounter usage={{ prompt: Math.round(totalTokens * 0.6), completion: Math.round(totalTokens * 0.4), total: totalTokens }} />
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-xs" onClick={handleExport} className="text-muted-foreground hover:text-foreground">
          <Export className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={handleClear} className="text-muted-foreground hover:text-destructive">
          <Trash className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
