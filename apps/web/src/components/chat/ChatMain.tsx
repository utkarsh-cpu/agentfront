import { useState, useRef, useEffect } from 'react'
import { List } from '@phosphor-icons/react'
import { Button } from '@workspace/ui/components/button'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { useConversationStore } from '@/stores/conversation.store'
import { MessageBubble } from './MessageBubble'
import { StreamingMessage } from './StreamingMessage'
import { ThinkingIndicator } from './ThinkingIndicator'
import { ChatComposer } from './ChatComposer'
import type { ChatMessage } from '@/types'

interface ChatMainProps {
  onSend: (message: string) => void
  onAbort: () => void
  onModelChange: (model: string) => void
  onToolsChange: (tools: string[]) => void
  onTitleChange: (title: string) => void
  onToggleSidebar: () => void
}

export function ChatMain({
  onSend,
  onAbort,
  onModelChange,
  onToolsChange,
  onTitleChange,
  onToggleSidebar,
}: ChatMainProps) {
  const activeConversation = useConversationStore((s) => s.activeConversation)
  const messages = useConversationStore((s) => s.messages)
  const isStreaming = useConversationStore((s) => s.isStreaming)
  const streamingContent = useConversationStore((s) => s.streamingContent)
  const bottomRef = useRef<HTMLDivElement>(null)

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  const handleTitleClick = () => {
    if (!activeConversation) return
    setTitleDraft(activeConversation.title)
    setIsEditingTitle(true)
  }

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    const trimmed = titleDraft.trim()
    if (trimmed && trimmed !== activeConversation?.title) {
      onTitleChange(trimmed)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      titleInputRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setIsEditingTitle(false)
    }
  }

  // Adapt ChatMessage to Message shape for MessageBubble
  function toMessageBubbleProps(msg: ChatMessage) {
    return {
      id: msg.id,
      role: msg.role,
      content: msg.content,
      toolCalls: msg.toolCalls,
      createdAt: msg.createdAt,
    }
  }

  if (!activeConversation) {
    return (
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex h-14 items-center border-b border-border px-4">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 size-8 rounded-none md:hidden"
            onClick={onToggleSidebar}
          >
            <List className="size-4" />
          </Button>
          <span className="font-mono text-sm text-muted-foreground">[NEXUS CHAT]</span>
        </div>

        {/* Empty state */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <div className="text-center">
            <p className="font-mono text-lg text-terminal">Start a conversation</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Create a new chat or select an existing one from the sidebar
            </p>
          </div>
        </div>

        {/* Composer (disabled) */}
        <ChatComposer
          onSend={onSend}
          onAbort={onAbort}
          onModelChange={onModelChange}
          onToolsChange={onToolsChange}
          disabled
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <Button
          variant="ghost"
          size="icon"
          className="mr-1 size-8 rounded-none md:hidden"
          onClick={onToggleSidebar}
        >
          <List className="size-4" />
        </Button>
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="flex-1 border-b border-terminal/40 bg-transparent font-mono text-sm outline-none"
          />
        ) : (
          <button
            onClick={handleTitleClick}
            className="flex-1 truncate text-left font-mono text-sm transition-colors hover:text-terminal"
          >
            {activeConversation.title}
          </button>
        )}
        <span className="shrink-0 border border-border/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          {activeConversation.modelName}
        </span>
      </div>

      {/* Message Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="mx-auto max-w-3xl space-y-4 py-4">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <p className="font-mono text-sm text-muted-foreground">
                Send a message to start the conversation
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={toMessageBubbleProps(msg)} />
          ))}
          {isStreaming && streamingContent && (
            <StreamingMessage content={streamingContent} />
          )}
          {isStreaming && !streamingContent && <ThinkingIndicator />}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Composer */}
      <ChatComposer
        onSend={onSend}
        onAbort={onAbort}
        onModelChange={onModelChange}
        onToolsChange={onToolsChange}
      />
    </div>
  )
}
