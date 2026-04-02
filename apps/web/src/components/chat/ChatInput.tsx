import { useState, useRef, useEffect } from "react"
import { PaperPlaneRight, Stop } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { useChatStore } from "@/stores/chat.store"

interface ChatInputProps {
  onSend: (message: string) => void
  onAbort: () => void
}

export function ChatInput({ onSend, onAbort }: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isStreaming = useChatStore((s) => s.isStreaming)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px"
    }
  }, [value])

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-border p-4">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isStreaming}
          rows={1}
          className="flex-1 resize-none border border-input bg-transparent px-3 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground focus:border-terminal disabled:opacity-50"
        />
        {isStreaming ? (
          <Button onClick={onAbort} variant="outline" size="icon" className="shrink-0 border-destructive text-destructive hover:bg-destructive/10">
            <Stop className="size-4" weight="fill" />
          </Button>
        ) : (
          <Button onClick={handleSend} disabled={!value.trim()} className="shrink-0 bg-terminal text-black hover:bg-terminal/80 disabled:opacity-30">
            <PaperPlaneRight className="size-4" weight="fill" />
          </Button>
        )}
      </div>
    </div>
  )
}
