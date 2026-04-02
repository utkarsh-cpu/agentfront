import { X, File } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"

interface AttachmentPreviewProps {
  fileName: string
  fileSize?: number
  onRemove: () => void
}

export function AttachmentPreview({ fileName, fileSize, onRemove }: AttachmentPreviewProps) {
  const formatSize = (bytes?: number) => {
    if (!bytes) return ""
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <div className="inline-flex items-center gap-2 border border-border/50 bg-muted/20 px-3 py-1.5">
      <File className="size-4 text-muted-foreground" weight="duotone" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xs">{fileName}</p>
        {fileSize && <p className="font-mono text-[10px] text-muted-foreground">{formatSize(fileSize)}</p>}
      </div>
      <Button variant="ghost" size="icon-xs" onClick={onRemove} className="text-muted-foreground hover:text-destructive">
        <X className="size-3" />
      </Button>
    </div>
  )
}
