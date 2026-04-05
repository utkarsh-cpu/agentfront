import { useState, useRef, useEffect } from 'react'
import {
  PaperPlaneRight,
  Stop,
  CaretDown,
  Wrench,
  MagnifyingGlass,
  Code,
  File,
  PlugsConnected,
  ChartBar,
  Image,
} from '@phosphor-icons/react'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { cn } from '@workspace/ui/lib/utils'
import { useConversationStore } from '@/stores/conversation.store'

const AVAILABLE_MODELS = [
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { id: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
  { id: 'gpt-4o', label: 'GPT-4o' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
] as const

const AVAILABLE_TOOLS = [
  { id: 'web_search', label: 'Web Search', icon: MagnifyingGlass },
  { id: 'code_execution', label: 'Code Execution', icon: Code },
  { id: 'file_read', label: 'File Read', icon: File },
  { id: 'api_call', label: 'API Calls', icon: PlugsConnected },
  { id: 'data_analysis', label: 'Data Analysis', icon: ChartBar },
  { id: 'image_generation', label: 'Image Gen', icon: Image },
] as const

interface ChatComposerProps {
  onSend: (message: string) => void
  onAbort: () => void
  onModelChange: (model: string) => void
  onToolsChange: (tools: string[]) => void
  disabled?: boolean
}

export function ChatComposer({ onSend, onAbort, onModelChange, onToolsChange, disabled }: ChatComposerProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isStreaming = useConversationStore((s) => s.isStreaming)
  const activeConversation = useConversationStore((s) => s.activeConversation)

  const currentModel = activeConversation?.modelName ?? 'claude-sonnet-4-6'
  const currentTools = activeConversation?.tools ?? []

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
    }
  }, [value])

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleTool = (toolId: string) => {
    const next = currentTools.includes(toolId)
      ? currentTools.filter((t) => t !== toolId)
      : [...currentTools, toolId]
    onToolsChange(next)
  }

  return (
    <div className="border-t border-border p-4">
      <div className="mx-auto max-w-3xl">
        <div
          className={cn(
            'border border-border transition-colors',
            'focus-within:border-terminal/20'
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isStreaming || disabled}
            rows={1}
            className="w-full resize-none bg-transparent px-3 pt-3 pb-2 font-mono text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          <div className="flex items-center gap-1.5 px-2 pb-2">
            {/* Model Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 rounded-none border border-border/50 px-2 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-muted/20 hover:text-foreground">
                  {AVAILABLE_MODELS.find((m) => m.id === currentModel)?.label ?? currentModel}
                  <CaretDown className="size-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-48 rounded-none p-1">
                {AVAILABLE_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => onModelChange(model.id)}
                    className={cn(
                      'flex w-full items-center rounded-none px-2 py-1.5 font-mono text-xs transition-colors',
                      currentModel === model.id
                        ? 'bg-terminal/10 text-terminal'
                        : 'hover:bg-muted/20'
                    )}
                  >
                    {model.label}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Tools Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 rounded-none border border-border/50 px-2 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-muted/20 hover:text-foreground">
                  <Wrench className="size-3" />
                  Tools
                  {currentTools.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 rounded-none px-1 font-mono text-[9px]">
                      {currentTools.length}
                    </Badge>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-56 rounded-none p-1">
                {AVAILABLE_TOOLS.map((tool) => {
                  const Icon = tool.icon
                  const isActive = currentTools.includes(tool.id)
                  return (
                    <label
                      key={tool.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-none px-2 py-1.5 transition-colors',
                        isActive ? 'bg-terminal/5' : 'hover:bg-muted/20'
                      )}
                    >
                      <Checkbox
                        checked={isActive}
                        onCheckedChange={() => toggleTool(tool.id)}
                        className="size-3.5"
                      />
                      <Icon className="size-3.5 text-muted-foreground" />
                      <span className="font-mono text-xs">{tool.label}</span>
                    </label>
                  )
                })}
              </PopoverContent>
            </Popover>

            <div className="flex-1" />

            {/* Send / Abort */}
            {isStreaming ? (
              <Button
                onClick={onAbort}
                variant="outline"
                size="icon"
                className="size-7 shrink-0 rounded-none border-destructive text-destructive hover:bg-destructive/10"
              >
                <Stop className="size-3.5" weight="fill" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!value.trim() || disabled}
                size="icon"
                className="size-7 shrink-0 rounded-none bg-terminal text-black hover:bg-terminal/80 disabled:opacity-30"
              >
                <PaperPlaneRight className="size-3.5" weight="fill" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
