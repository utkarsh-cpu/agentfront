import { useLocation } from "react-router-dom"
import {
  MagnifyingGlass,
  Bell,
  List,
  Sun,
  Moon,
  User,
  Gear,
  SignOut,
  Command,
} from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"
import { useUIStore } from "@/stores/ui.store"
import { useAuthStore } from "@/stores/auth.store"
import { useTheme } from "@/components/theme-provider"

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/agents": "Agents",
  "/tasks": "Tasks",
  "/history": "History",
  "/settings": "Settings",
}

function getPageTitle(pathname: string): string {
  for (const [route, title] of Object.entries(routeTitles)) {
    if (pathname.startsWith(route)) return title
  }
  return "Dashboard"
}

export function TopBar() {
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const pageTitle = getPageTitle(location.pathname)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <List className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-heading text-lg font-semibold tracking-wide">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Search trigger */}
        <Button
          variant="outline"
          className="hidden h-8 gap-2 rounded-none border-border px-3 text-xs text-muted-foreground sm:flex"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <MagnifyingGlass className="h-3.5 w-3.5" />
          <span>Search…</span>
          <kbd className="pointer-events-none ml-2 inline-flex h-5 items-center gap-0.5 border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </Button>

        {/* Mobile search */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none sm:hidden"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <MagnifyingGlass className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-none">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-2 w-2 bg-terminal" />
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 gap-2 rounded-none px-2"
            >
              <Avatar className="h-6 w-6 rounded-none">
                <AvatarImage src={undefined} />
                <AvatarFallback className="rounded-none bg-terminal/20 text-terminal text-[10px]">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm md:inline-block">
                {user?.name ?? "User"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-none">
            <DropdownMenuItem className="gap-2 rounded-none">
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 rounded-none">
              <Gear className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 rounded-none"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 rounded-none text-destructive"
              onClick={() => void logout()}
            >
              <SignOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
