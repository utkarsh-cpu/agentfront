import * as React from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@workspace/ui/lib/utils"
import { CopyButton } from "./CopyButton"

interface MarkdownRendererProps {
  content: string
  className?: string
}

const components: Components = {
  h1: ({ children, ...props }) => (
    <h1
      className="mb-4 mt-6 font-sans text-lg font-semibold tracking-tight text-foreground first:mt-0"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="mb-3 mt-5 font-sans text-base font-semibold tracking-tight text-foreground first:mt-0"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mb-2 mt-4 font-sans text-sm font-semibold text-foreground first:mt-0"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-3 text-sm leading-relaxed last:mb-0" {...props}>
      {children}
    </p>
  ),
  a: ({ children, ...props }) => (
    <a
      className="text-terminal underline underline-offset-2 hover:text-terminal-muted"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul className="mb-3 ml-4 list-inside list-disc space-y-1 text-sm" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mb-3 ml-4 list-inside list-decimal space-y-1 text-sm" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-sm leading-relaxed" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="mb-3 border-l-2 border-terminal/40 pl-3 text-sm text-muted-foreground italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }) => {
    const isInline = !className
    if (isInline) {
      return (
        <code
          className="bg-terminal/10 px-1 py-0.5 font-mono text-xs text-terminal"
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <code className={cn("font-mono text-xs", className)} {...props}>
        {children}
      </code>
    )
  },
  pre: ({ children, ...props }) => {
    const codeText = extractText(children)
    return (
      <div className="group relative mb-3">
        <div className="flex items-center justify-between border border-b-0 border-border/50 bg-muted/40 px-3 py-1">
          <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
            code
          </span>
          <CopyButton text={codeText} />
        </div>
        <pre
          className="overflow-x-auto border border-border/50 bg-background p-3 text-xs leading-relaxed"
          {...props}
        >
          {children}
        </pre>
      </div>
    )
  },
  table: ({ children, ...props }) => (
    <div className="mb-3 overflow-x-auto">
      <table
        className="w-full border-collapse border border-border/50 font-mono text-xs"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-muted/30" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border border-border/50 px-3 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-border/50 px-3 py-2 text-xs" {...props}>
      {children}
    </td>
  ),
  hr: (props) => (
    <hr className="my-4 border-border/50" {...props} />
  ),
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node
  if (typeof node === "number") return String(node)
  if (!node) return ""
  if (Array.isArray(node)) return node.map(extractText).join("")
  if (typeof node === "object" && "props" in node) {
    return extractText((node as React.ReactElement).props.children)
  }
  return ""
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("text-sm text-foreground", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
