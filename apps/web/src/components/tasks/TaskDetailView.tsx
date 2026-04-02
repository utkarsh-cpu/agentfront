import type { Task } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { TaskStatusBadge } from "./TaskStatusBadge"
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer"
import { JsonViewer } from "@/components/shared/JsonViewer"
import { TokenCounter } from "@/components/shared/TokenCounter"
import { RelativeTime } from "@/components/shared/RelativeTime"

interface TaskDetailViewProps {
  task: Task
}

export function TaskDetailView({ task }: TaskDetailViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <TaskStatusBadge status={task.status} />
            <TokenCounter usage={task.tokenUsage} />
          </div>
          <div className="mt-2 flex gap-4 font-mono text-[10px] text-muted-foreground">
            <span>Agent: {task.agentName ?? task.agentId}</span>
            <span>Started: <RelativeTime date={task.startedAt} /></span>
            {task.completedAt && <span>Completed: <RelativeTime date={task.completedAt} /></span>}
          </div>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="font-mono text-xs uppercase tracking-wider">Input</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{task.input}</p>
        </CardContent>
      </Card>

      {task.output && (
        <Card className="border-border/50">
          <CardHeader><CardTitle className="font-mono text-xs uppercase tracking-wider">Output</CardTitle></CardHeader>
          <CardContent>
            <MarkdownRenderer content={task.output} />
          </CardContent>
        </Card>
      )}

      {task.toolCalls.length > 0 && (
        <Card className="border-border/50">
          <CardHeader><CardTitle className="font-mono text-xs uppercase tracking-wider">Tool Calls ({task.toolCalls.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {task.toolCalls.map((tc) => (
              <div key={tc.id} className="border border-border/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-medium text-terminal">{tc.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{tc.durationMs}ms</span>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
                  <div>
                    <p className="mb-1 font-mono text-[10px] text-muted-foreground uppercase">Input</p>
                    <JsonViewer data={tc.input} collapsed={false} />
                  </div>
                  <div>
                    <p className="mb-1 font-mono text-[10px] text-muted-foreground uppercase">Output</p>
                    <JsonViewer data={tc.output} collapsed={false} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
