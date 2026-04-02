import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

type SkeletonVariant = "card" | "list-item" | "table-row" | "message"

interface SkeletonLoaderProps {
  variant: SkeletonVariant
  className?: string
}

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 border border-border/50 p-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex items-center gap-4 pt-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-border/30 px-3 py-2.5",
        className,
      )}
    >
      <Skeleton className="size-8 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-2/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

function TableRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 border-b border-border/30 px-3 py-2.5",
        className,
      )}
    >
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-3.5 w-32 flex-1" />
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-3.5 w-20" />
      <Skeleton className="h-3.5 w-16" />
    </div>
  )
}

function MessageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-3 px-3 py-3", className)}>
      <Skeleton className="size-7 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    </div>
  )
}

const variantMap: Record<
  SkeletonVariant,
  React.FC<{ className?: string }>
> = {
  card: CardSkeleton,
  "list-item": ListItemSkeleton,
  "table-row": TableRowSkeleton,
  message: MessageSkeleton,
}

export function SkeletonLoader({ variant, className }: SkeletonLoaderProps) {
  const Component = variantMap[variant]
  return <Component className={className} />
}
