import { useEffect, useRef } from "react"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { useChatStore } from "@/stores/chat.store"
import { MessageBubble } from "./MessageBubble"
import { StreamingMessage } from "./StreamingMessage"
import { ThinkingIndicator } from "./ThinkingIndicator"

export function MessageList() {
  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const streamingContent = useChatStore((s) => s.streamingContent)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingContent])

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="mx-auto max-w-3xl space-y-4 py-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isStreaming && streamingContent && <StreamingMessage content={streamingContent} />}
        {isStreaming && !streamingContent && <ThinkingIndicator />}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
