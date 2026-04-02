import * as React from "react"
import { CaretRight, CaretDown } from "@phosphor-icons/react"
import { cn } from "@workspace/ui/lib/utils"

interface JsonViewerProps {
  data: unknown
  collapsed?: boolean
  className?: string
}

export function JsonViewer({
  data,
  collapsed = true,
  className,
}: JsonViewerProps) {
  return (
    <div
      className={cn(
        "overflow-auto border border-border/50 bg-background p-3 font-mono text-xs",
        className,
      )}
    >
      <JsonNode value={data} defaultCollapsed={collapsed} depth={0} />
    </div>
  )
}

interface JsonNodeProps {
  value: unknown
  defaultCollapsed: boolean
  depth: number
  keyName?: string
}

function JsonNode({ value, defaultCollapsed, depth, keyName }: JsonNodeProps) {
  if (value === null) {
    return (
      <span>
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span className="text-muted-foreground italic">null</span>
      </span>
    )
  }

  if (typeof value === "boolean") {
    return (
      <span>
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span className="text-yellow-400">{String(value)}</span>
      </span>
    )
  }

  if (typeof value === "number") {
    return (
      <span>
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span className="text-yellow-400">{value}</span>
      </span>
    )
  }

  if (typeof value === "string") {
    return (
      <span>
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span className="text-terminal">"{value}"</span>
      </span>
    )
  }

  if (Array.isArray(value)) {
    return (
      <CollapsibleNode
        keyName={keyName}
        defaultCollapsed={defaultCollapsed && depth > 0}
        openBracket="["
        closeBracket="]"
        isEmpty={value.length === 0}
        preview={`${value.length} items`}
      >
        {value.map((item, i) => (
          <div key={i} className="pl-4">
            <JsonNode
              value={item}
              defaultCollapsed={defaultCollapsed}
              depth={depth + 1}
            />
            {i < value.length - 1 && (
              <span className="text-muted-foreground">,</span>
            )}
          </div>
        ))}
      </CollapsibleNode>
    )
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
    return (
      <CollapsibleNode
        keyName={keyName}
        defaultCollapsed={defaultCollapsed && depth > 0}
        openBracket="{"
        closeBracket="}"
        isEmpty={entries.length === 0}
        preview={`${entries.length} keys`}
      >
        {entries.map(([key, val], i) => (
          <div key={key} className="pl-4">
            <JsonNode
              value={val}
              defaultCollapsed={defaultCollapsed}
              depth={depth + 1}
              keyName={key}
            />
            {i < entries.length - 1 && (
              <span className="text-muted-foreground">,</span>
            )}
          </div>
        ))}
      </CollapsibleNode>
    )
  }

  return (
    <span>
      {keyName !== undefined && <KeyLabel name={keyName} />}
      <span className="text-muted-foreground">{String(value)}</span>
    </span>
  )
}

function KeyLabel({ name }: { name: string }) {
  return (
    <>
      <span className="text-foreground">"{name}"</span>
      <span className="text-muted-foreground">: </span>
    </>
  )
}

interface CollapsibleNodeProps {
  keyName?: string
  defaultCollapsed: boolean
  openBracket: string
  closeBracket: string
  isEmpty: boolean
  preview: string
  children: React.ReactNode
}

function CollapsibleNode({
  keyName,
  defaultCollapsed,
  openBracket,
  closeBracket,
  isEmpty,
  preview,
  children,
}: CollapsibleNodeProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  if (isEmpty) {
    return (
      <span>
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span className="text-muted-foreground">
          {openBracket}
          {closeBracket}
        </span>
      </span>
    )
  }

  return (
    <span>
      {keyName !== undefined && <KeyLabel name={keyName} />}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="inline-flex cursor-pointer items-center text-muted-foreground hover:text-terminal"
      >
        {collapsed ? (
          <CaretRight weight="bold" className="inline size-3" />
        ) : (
          <CaretDown weight="bold" className="inline size-3" />
        )}
      </button>
      <span className="text-muted-foreground">{openBracket}</span>
      {collapsed ? (
        <>
          <span className="mx-1 text-muted-foreground/60 italic">
            {preview}
          </span>
          <span className="text-muted-foreground">{closeBracket}</span>
        </>
      ) : (
        <>
          {children}
          <div>
            <span className="text-muted-foreground">{closeBracket}</span>
          </div>
        </>
      )}
    </span>
  )
}
