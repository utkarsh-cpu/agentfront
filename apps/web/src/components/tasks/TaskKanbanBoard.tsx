import type { Task, TaskStatus } from "@/types"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { TaskCard } from "./TaskCard"

const columnConfig: { status: TaskStatus[]; label: string }[] = [
  { status: ["queued"], label: "Queued" },
  { status: ["running"], label: "Running" },
  { status: ["completed", "failed", "cancelled"], label: "Done" },
]

interface TaskKanbanBoardProps {
  tasks: Task[]
}

export function TaskKanbanBoard({ tasks }: TaskKanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {columnConfig.map((col) => {
        const columnTasks = tasks.filter((t) => col.status.includes(t.status))
        return (
          <div key={col.label} className="flex flex-col border border-border/50 bg-muted/5">
            <div className="border-b border-border/50 px-3 py-2">
              <h3 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {col.label}
                <span className="ml-2 text-terminal">{columnTasks.length}</span>
              </h3>
            </div>
            <ScrollArea className="max-h-[500px] p-2">
              <div className="space-y-2">
                {columnTasks.length > 0 ? (
                  columnTasks.map((task) => <TaskCard key={task.id} task={task} />)
                ) : (
                  <p className="py-8 text-center font-mono text-[10px] text-muted-foreground">No tasks</p>
                )}
              </div>
            </ScrollArea>
          </div>
        )
      })}
    </div>
  )
}
