import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { useTaskStore } from "@/stores/task.store"
import { useAbortController } from "@/hooks/useAbortController"
import { tasksService } from "@/services/tasks.service"
import { TaskList } from "@/components/tasks/TaskList"
import { TaskKanbanBoard } from "@/components/tasks/TaskKanbanBoard"
import { TaskFilters } from "@/components/tasks/TaskFilters"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

export function TasksPage() {
  const { tasks, filters, isLoading, setTasks, setFilters, resetFilters, setLoading, setError } = useTaskStore()
  const { getSignal } = useAbortController()
  const [view, setView] = useState<"list" | "kanban">("list")

  useEffect(() => {
    setLoading(true)
    tasksService
      .getTasks(filters, getSignal())
      .then((res) => setTasks(res.data, res.total, res.totalPages))
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message)
      })
  }, [filters, getSignal, setTasks, setLoading, setError])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">Monitor and manage agent tasks</p>
      </div>

      <TaskFilters filters={filters} onFilterChange={setFilters} onReset={resetFilters} />

      <Tabs value={view} onValueChange={(v) => setView(v as "list" | "kanban")}>
        <TabsList className="border-b border-border bg-transparent rounded-none">
          <TabsTrigger value="list" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-terminal data-[state=active]:text-terminal">List</TabsTrigger>
          <TabsTrigger value="kanban" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-terminal data-[state=active]:text-terminal">Kanban</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
          ) : (
            <TaskList tasks={tasks} />
          )}
        </TabsContent>

        <TabsContent value="kanban" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
          ) : (
            <TaskKanbanBoard tasks={tasks} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
