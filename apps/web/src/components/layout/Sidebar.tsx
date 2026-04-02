import { NavLink } from "react-router-dom"
import {
  House,
  Robot,
  ListChecks,
  ClockCounterClockwise,
  Gear,
  CaretLeft,
  SignOut,
} from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { Badge } from "@workspace/ui/components/badge"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"
import { useUIStore } from "@/stores/ui.store"
import { useAuthStore } from "@/stores/auth.store"

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: House },
  { label: "Agents", path: "/agents", icon: Robot, badge: true },
  { label: "Tasks", path: "/tasks", icon: ListChecks },
  { label: "History", path: "/history", icon: ClockCounterClockwise },
  { label: "Settings", path: "/settings", icon: Gear },
] as const

interface SidebarProps {
  mobile?: boolean
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const isCollapsed = !mobile && collapsed

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-full flex-col border-r border-border bg-background transition-all duration-200",
          isCollapsed ? "w-16" : "w-60"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          {!isCollapsed && (
            <span className="font-heading text-lg font-bold tracking-widest text-terminal">
              [NEXUS]
            </span>
          )}
          {isCollapsed && (
            <span className="mx-auto font-heading text-sm font-bold text-terminal">
              N
            </span>
          )}
          {!mobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-none"
                  onClick={() => setSidebarCollapsed(!collapsed)}
                >
                  <CaretLeft
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isCollapsed && "rotate-180"
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="rounded-none">
                {isCollapsed ? "Expand" : "Collapse"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col gap-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
                          "hover:bg-terminal/10 hover:text-terminal",
                          isActive
                            ? "bg-terminal/10 text-terminal border-l-2 border-terminal"
                            : "text-muted-foreground",
                          isCollapsed && "justify-center px-0"
                        )
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0" weight="duotone" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="rounded-none bg-terminal/20 text-terminal text-xs px-1.5 py-0"
                            >
                              3
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="rounded-none">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </nav>
        </ScrollArea>

        <Separator className="rounded-none" />

        {/* User section */}
        <div
          className={cn(
            "flex items-center gap-3 border-t border-border p-3",
            isCollapsed && "justify-center p-2"
          )}
        >
          <Avatar className="h-8 w-8 rounded-none">
            <AvatarImage src={undefined} />
            <AvatarFallback className="rounded-none bg-terminal/20 text-terminal text-xs">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">
                  {user?.name ?? "User"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email ?? ""}
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 rounded-none text-muted-foreground hover:text-destructive"
                    onClick={() => void logout()}
                  >
                    <SignOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="rounded-none">
                  Logout
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
