import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function getVisiblePages(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | "…")[] = [1]

  if (current > 3) pages.push("…")

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) pages.push("…")

  pages.push(total)
  return pages
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = getVisiblePages(currentPage, totalPages)

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center gap-1 font-mono", className)}
    >
      <Button
        variant="ghost"
        size="icon-xs"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <CaretLeft weight="bold" className="size-3.5" />
      </Button>

      {pages.map((page, i) =>
        page === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="flex size-6 items-center justify-center text-xs text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "outline" : "ghost"}
            size="icon-xs"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              "text-xs",
              page === currentPage &&
                "border-terminal/40 text-terminal",
            )}
          >
            {page}
          </Button>
        ),
      )}

      <Button
        variant="ghost"
        size="icon-xs"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <CaretRight weight="bold" className="size-3.5" />
      </Button>
    </nav>
  )
}
