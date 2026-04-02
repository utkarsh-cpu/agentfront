import { X } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"
import { useUIStore } from "@/stores/ui.store"

export function RightPanel() {
  const open = useUIStore((s) => s.rightPanelOpen)
  const content = useUIStore((s) => s.rightPanelContent)
  const setOpen = useUIStore((s) => s.setRightPanelOpen)

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-border bg-background transition-transform duration-200 ease-in-out sm:w-96 md:relative md:z-0",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <span className="font-heading text-sm font-semibold tracking-wide">
            Details
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-none"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {content ?? (
              <p className="text-sm text-muted-foreground">
                No content selected.
              </p>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}
