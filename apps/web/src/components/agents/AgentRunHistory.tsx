import type { ColumnDef } from "@tanstack/react-table"
import type { Task } from "@/types"
import { DataTable } from "@/components/shared/DataTable"
import { RelativeTime } from "@/components/shared/RelativeTime"
import { TokenCounter } from "@/components/shared/TokenCounter"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

const statusStyles: Record<string, string> = {
  completed: "border-terminal/40 text-terminal bg-terminal/10",
  failed: "border-destructive/40 text-destructive bg-destructive/10",
  running: "border-blue-400/40 text-blue-400 bg-blue-400/10",
  queued: "border-muted-foreground/30 text-muted-foreground",
  cancelled: "border-yellow-500/40 text-yellow-500 bg-yellow-500/10",
}

const columns: ColumnDef<Task, unknown>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as string
      return (
        <Badge variant="outline" className={cn("rounded-none text-[10px]", statusStyles[status])}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "input",
    header: "Input",
    cell: ({ getValue }) => (
      <span className="line-clamp-1 max-w-[200px] text-xs">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "tokenUsage",
    header: "Tokens",
    cell: ({ getValue }) => <TokenCounter usage={getValue() as Task["tokenUsage"]} />,
  },
  {
    accessorKey: "startedAt",
    header: "Started",
    cell: ({ getValue }) => <RelativeTime date={getValue() as string} />,
  },
]

interface AgentRunHistoryProps {
  tasks: Task[]
  isLoading?: boolean
}

export function AgentRunHistory({ tasks, isLoading }: AgentRunHistoryProps) {
  return (
    <DataTable
      columns={columns}
      data={tasks}
      isLoading={isLoading}
      emptyMessage="No runs yet."
    />
  )
}
