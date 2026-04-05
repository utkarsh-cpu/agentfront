import { useState, useCallback, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  House,
  Robot,
  ListChecks,
  ClockCounterClockwise,
  Gear,
  MagnifyingGlass,
} from "@phosphor-icons/react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"
import { useUIStore } from "@/stores/ui.store"

interface CommandItem {
  id: string
  label: string
  group: "Pages" | "Actions"
  icon: React.ComponentType<{ className?: string; weight?: string }>
  action: () => void
}

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen)
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen)
  const navigate = useNavigate()

  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)

  const items: CommandItem[] = useMemo(
    () => [
      {
        id: "chat",
        label: "Chat",
        group: "Pages",
        icon: House,
        action: () => navigate("/chat"),
      },
      {
        id: "agents",
        label: "Agents",
        group: "Pages",
        icon: Robot,
        action: () => navigate("/agents"),
      },
      {
        id: "tasks",
        label: "Tasks",
        group: "Pages",
        icon: ListChecks,
        action: () => navigate("/tasks"),
      },
      {
        id: "history",
        label: "History",
        group: "Pages",
        icon: ClockCounterClockwise,
        action: () => navigate("/history"),
      },
      {
        id: "settings",
        label: "Settings",
        group: "Pages",
        icon: Gear,
        action: () => navigate("/settings"),
      },
      {
        id: "create-agent",
        label: "Create Agent",
        group: "Actions",
        icon: Robot,
        action: () => navigate("/agents/new"),
      },
      {
        id: "new-task",
        label: "New Task",
        group: "Actions",
        icon: ListChecks,
        action: () => navigate("/tasks/new"),
      },
    ],
    [navigate]
  )

  const filtered = useMemo(() => {
    if (!query) return items
    const q = query.toLowerCase()
    return items.filter((item) => item.label.toLowerCase().includes(q))
  }, [items, query])

  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>()
    for (const item of filtered) {
      const existing = map.get(item.group) ?? []
      existing.push(item)
      map.set(item.group, existing)
    }
    return map
  }, [filtered])

  const selectItem = useCallback(
    (item: CommandItem) => {
      item.action()
      setOpen(false)
      setQuery("")
      setActiveIndex(0)
    },
    [setOpen]
  )

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) {
      setQuery("")
      setActiveIndex(0)
    }
  }, [open])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % filtered.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length)
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      e.preventDefault()
      selectItem(filtered[activeIndex])
    }
  }

  let flatIndex = -1

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-none border-border p-0">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>

        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-4">
          <MagnifyingGlass className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </p>
          )}
          {Array.from(groups.entries()).map(([group, groupItems]) => (
            <div key={group}>
              <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </div>
              {groupItems.map((item) => {
                flatIndex++
                const idx = flatIndex
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
                      idx === activeIndex
                        ? "bg-terminal/10 text-terminal"
                        : "text-foreground hover:bg-muted"
                    )}
                    onClick={() => selectItem(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
          <span>
            <kbd className="border border-border bg-muted px-1 py-0.5">↑↓</kbd>{" "}
            navigate
          </span>
          <span>
            <kbd className="border border-border bg-muted px-1 py-0.5">↵</kbd>{" "}
            select
          </span>
          <span>
            <kbd className="border border-border bg-muted px-1 py-0.5">esc</kbd>{" "}
            close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
