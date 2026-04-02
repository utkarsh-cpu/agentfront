import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAbortController } from "@/hooks/useAbortController"
import { tasksService } from "@/services/tasks.service"
import { TaskDetailView } from "@/components/tasks/TaskDetailView"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import type { Task } from "@/types"

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { getSignal } = useAbortController()

  useEffect(() => {
    if (!taskId) return
    setIsLoading(true)
    tasksService
      .getTask(taskId, getSignal())
      .then(setTask)
      .catch(() => setTask(null))
      .finally(() => setIsLoading(false))
  }, [taskId, getSignal])

  if (isLoading || !task) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold tracking-tight">Task Detail</h1>
      <TaskDetailView task={task} />
    </div>
  )
}
