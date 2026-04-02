import { useState } from "react"
import { CaretRight, CaretDown, Wrench } from "@phosphor-icons/react"
import type { ToolCall } from "@/types"
import { JsonViewer } from "@/components/shared/JsonViewer"

interface ToolCallBlockProps {
  toolCall: ToolCall
}

export function ToolCallBlock({ toolCall }: ToolCallBlockProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-terminal/20 bg-terminal/5">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs transition-colors hover:bg-terminal/10"
      >
        {expanded ? <CaretDown className="size-3 text-terminal" /> : <CaretRight className="size-3 text-terminal" />}
        <Wrench className="size-3 text-terminal" weight="duotone" />
        <span className="font-medium text-terminal">{toolCall.name}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{toolCall.durationMs}ms</span>
      </button>
      {expanded && (
        <div className="space-y-2 border-t border-terminal/10 p-3">
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Input</p>
            <JsonViewer data={toolCall.input} collapsed={false} />
          </div>
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Output</p>
            <JsonViewer data={toolCall.output} collapsed={false} />
          </div>
        </div>
      )}
    </div>
  )
}
