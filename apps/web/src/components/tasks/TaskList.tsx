import type { ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import type { Task } from "@/types"
import { DataTable } from "@/components/shared/DataTable"
import { TaskStatusBadge } from "./TaskStatusBadge"
import { RelativeTime } from "@/components/shared/RelativeTime"
import { TokenCounter } from "@/components/shared/TokenCounter"

const columns: ColumnDef<Task, unknown>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <TaskStatusBadge status={getValue() as Task["status"]} />,
  },
  {
    accessorKey: "agentName",
    header: "Agent",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{(getValue() as string) || "—"}</span>
    ),
  },
  {
    accessorKey: "input",
    header: "Input",
    cell: ({ getValue }) => (
      <span className="line-clamp-1 max-w-[250px] text-xs">{getValue() as string}</span>
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

interface TaskListProps {
  tasks: Task[]
  isLoading?: boolean
}

export function TaskList({ tasks, isLoading }: TaskListProps) {
  const navigate = useNavigate()

  return (
    <div onClick={(e) => {
      const row = (e.target as HTMLElement).closest("tr")
      const taskId = row?.dataset?.taskId
      if (taskId) navigate(`/tasks/${taskId}`)
    }}>
      <DataTable columns={columns} data={tasks} isLoading={isLoading} emptyMessage="No tasks found." />
    </div>
  )
}
