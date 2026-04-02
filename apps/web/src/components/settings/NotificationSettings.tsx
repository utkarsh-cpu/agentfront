import { Switch } from "@workspace/ui/components/switch"
import { Label } from "@workspace/ui/components/label"
import { useState } from "react"

const notifications = [
  { id: "email", label: "Email Notifications", description: "Receive email alerts for important events" },
  { id: "browser", label: "Browser Notifications", description: "Show browser push notifications" },
  { id: "task_complete", label: "Task Completion", description: "Notify when tasks finish" },
  { id: "errors", label: "Error Alerts", description: "Notify on agent errors and failures" },
]

export function NotificationSettings() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    email: true,
    browser: false,
    task_complete: true,
    errors: true,
  })

  const toggle = (id: string) => {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="max-w-md space-y-4">
      {notifications.map((item) => (
        <div key={item.id} className="flex items-center justify-between border border-border/50 p-3">
          <div>
            <Label className="text-sm font-medium">{item.label}</Label>
            <p className="font-mono text-[10px] text-muted-foreground">{item.description}</p>
          </div>
          <Switch checked={enabled[item.id] ?? false} onCheckedChange={() => toggle(item.id)} />
        </div>
      ))}
    </div>
  )
}
