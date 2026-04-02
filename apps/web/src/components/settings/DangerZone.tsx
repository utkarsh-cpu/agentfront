import { useState } from "react"
import { Warning } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"

export function DangerZone() {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)

  return (
    <div className="max-w-md space-y-4 border border-destructive/30 p-4">
      <div className="flex items-center gap-2">
        <Warning className="size-4 text-destructive" weight="duotone" />
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-destructive">
          Danger Zone
        </h3>
      </div>

      <div className="flex items-center justify-between border border-border/30 p-3">
        <div>
          <p className="text-sm font-medium">Clear All History</p>
          <p className="font-mono text-[10px] text-muted-foreground">Remove all task history and activity logs</p>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setClearOpen(true)}>Clear</Button>
      </div>

      <div className="flex items-center justify-between border border-border/30 p-3">
        <div>
          <p className="text-sm font-medium">Delete Account</p>
          <p className="font-mono text-[10px] text-muted-foreground">Permanently delete your account and all data</p>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>Delete</Button>
      </div>

      <ConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Clear All History"
        description="This will permanently remove all task history and activity logs. This action cannot be undone."
        confirmLabel="Clear History"
        variant="destructive"
        onConfirm={() => setClearOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Account"
        description="This will permanently delete your account and all associated data including agents, tasks, and API keys."
        confirmLabel="Delete Account"
        variant="destructive"
        onConfirm={() => setDeleteOpen(false)}
      />
    </div>
  )
}
