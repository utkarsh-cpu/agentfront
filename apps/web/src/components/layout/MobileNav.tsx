import { NavLink } from "react-router-dom"
import {
  House,
  Robot,
  ListChecks,
  ClockCounterClockwise,
  Gear,
} from "@phosphor-icons/react"
import { cn } from "@workspace/ui/lib/utils"

const tabs = [
  { label: "Chat", path: "/chat", icon: House },
  { label: "Agents", path: "/agents", icon: Robot },
  { label: "Tasks", path: "/tasks", icon: ListChecks },
  { label: "History", path: "/history", icon: ClockCounterClockwise },
  { label: "Settings", path: "/settings", icon: Gear },
] as const

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background md:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-terminal"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" weight="duotone" />
            <span>{tab.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
