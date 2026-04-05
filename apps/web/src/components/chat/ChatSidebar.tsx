import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Trash,
  House,
  Robot,
  ListChecks,
  ClockCounterClockwise,
  Gear,
  Key,
  User as UserIcon,
  SignOut,
  CaretUpDown,
  Sun,
  Moon,
  Monitor,
} from '@phosphor-icons/react'
import { Button } from '@workspace/ui/components/button'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { Separator } from '@workspace/ui/components/separator'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { cn } from '@workspace/ui/lib/utils'
import { useConversationStore } from '@/stores/conversation.store'
import { useAuthStore } from '@/stores/auth.store'
import { useTheme } from '@/components/theme-provider'
import type { Conversation } from '@/types'

interface ChatSidebarProps {
  onNewChat: () => void
  onDeleteConversation: (id: string) => void
}

function groupConversations(conversations: Conversation[]) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000)
  const weekStart = new Date(todayStart.getTime() - 7 * 86_400_000)

  const groups: { label: string; items: Conversation[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Last 7 Days', items: [] },
    { label: 'Older', items: [] },
  ]

  for (const conv of conversations) {
    const d = new Date(conv.updatedAt)
    if (d >= todayStart) groups[0].items.push(conv)
    else if (d >= yesterdayStart) groups[1].items.push(conv)
    else if (d >= weekStart) groups[2].items.push(conv)
    else groups[3].items.push(conv)
  }

  return groups.filter((g) => g.items.length > 0)
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function ChatSidebar({ onNewChat, onDeleteConversation }: ChatSidebarProps) {
  const navigate = useNavigate()
  const conversations = useConversationStore((s) => s.conversations)
  const activeConversation = useConversationStore((s) => s.activeConversation)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { theme, setTheme } = useTheme()

  const groups = groupConversations(conversations)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-full w-[260px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* New Chat Button */}
      <div className="p-3">
        <Button
          variant="outline"
          onClick={onNewChat}
          className="w-full justify-start gap-2 rounded-none border-terminal/40 font-mono text-sm text-terminal hover:bg-terminal/10"
        >
          <Plus className="size-4" weight="bold" />
          New Chat
        </Button>
      </div>

      <Separator className="mx-3 w-auto" />

      {/* Conversation List */}
      <ScrollArea className="flex-1 px-1">
        <div className="py-2">
          {groups.map((group) => (
            <div key={group.label} className="mb-2">
              <div className="px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {group.label}
              </div>
              {group.items.map((conv) => {
                const isActive = activeConversation?.id === conv.id
                return (
                  <div
                    key={conv.id}
                    className={cn(
                      'group relative mx-1 flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'border-l-2 border-terminal bg-terminal/10'
                        : 'border-l-2 border-transparent hover:bg-terminal/5'
                    )}
                    onClick={() => navigate(`/chat/${conv.id}`)}
                  >
                    <span className="flex-1 truncate font-mono text-xs">
                      {conv.title}
                    </span>
                    <span className="hidden font-mono text-[10px] text-muted-foreground group-hover:inline">
                      {relativeTime(conv.updatedAt)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteConversation(conv.id)
                      }}
                      className="hidden shrink-0 text-muted-foreground hover:text-destructive group-hover:inline-flex"
                    >
                      <Trash className="size-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="px-3 py-8 text-center font-mono text-xs text-muted-foreground">
              No conversations yet
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator className="mx-3 w-auto" />

      {/* User Block */}
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-none p-1.5 text-left transition-colors hover:bg-muted/20">
              <Avatar className="size-7 rounded-none">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="rounded-none bg-terminal/20 font-mono text-xs text-terminal">
                  {user?.name?.charAt(0).toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate font-mono text-xs">
                {user?.name ?? 'User'}
              </span>
              <CaretUpDown className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 rounded-none">
            <DropdownMenuItem onClick={() => navigate('/dashboard')} className="gap-2 rounded-none font-mono text-xs">
              <House className="size-4" /> Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/agents')} className="gap-2 rounded-none font-mono text-xs">
              <Robot className="size-4" /> Agents
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/tasks')} className="gap-2 rounded-none font-mono text-xs">
              <ListChecks className="size-4" /> Tasks
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/history')} className="gap-2 rounded-none font-mono text-xs">
              <ClockCounterClockwise className="size-4" /> History
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings/profile')} className="gap-2 rounded-none font-mono text-xs">
              <UserIcon className="size-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings/api-keys')} className="gap-2 rounded-none font-mono text-xs">
              <Key className="size-4" /> API Keys
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2 rounded-none font-mono text-xs">
              <Gear className="size-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="flex gap-1 px-2 py-1.5">
              {([
                { value: 'light' as const, icon: Sun },
                { value: 'dark' as const, icon: Moon },
                { value: 'system' as const, icon: Monitor },
              ]).map((t) => {
                const Icon = t.icon
                const isActive = theme === t.value
                return (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      'flex-1 rounded-none border px-2 py-1 transition-colors',
                      isActive
                        ? 'border-terminal bg-terminal/10 text-terminal'
                        : 'border-border hover:bg-muted/20'
                    )}
                  >
                    <Icon className="mx-auto size-3.5" weight={isActive ? 'fill' : 'regular'} />
                  </button>
                )
              })}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 rounded-none font-mono text-xs text-destructive">
              <SignOut className="size-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
