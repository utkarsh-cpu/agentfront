import * as React from "react"
import { Check, Copy } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

interface CopyButtonProps {
  text: string
  className?: string
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error("[CopyButton] Failed to copy text")
    }
  }, [text])

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={cn("text-muted-foreground hover:text-terminal", className)}
    >
      {copied ? (
        <Check className="size-3.5 text-terminal" weight="bold" />
      ) : (
        <Copy className="size-3.5" weight="bold" />
      )}
    </Button>
  )
}
