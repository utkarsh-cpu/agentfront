import { useState } from "react"
import { Trash, Plus, Key } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { CopyButton } from "@/components/shared/CopyButton"
import { RelativeTime } from "@/components/shared/RelativeTime"
import type { ApiKey } from "@/types"

const demoKeys: ApiKey[] = [
  { id: "1", name: "Production", maskedKey: "sk-...a1b2", createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), lastUsedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "2", name: "Development", maskedKey: "sk-...c3d4", createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
]

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>(demoKeys)
  const [createOpen, setCreateOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [revokeId, setRevokeId] = useState<string | null>(null)

  const handleCreate = () => {
    if (!newKeyName.trim()) return
    const key: ApiKey = {
      id: crypto.randomUUID(),
      name: newKeyName,
      maskedKey: `sk-...${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    }
    setKeys((prev) => [...prev, key])
    setNewKeyName("")
    setCreateOpen(false)
  }

  const handleRevoke = () => {
    if (!revokeId) return
    setKeys((prev) => prev.filter((k) => k.id !== revokeId))
    setRevokeId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">API Keys</h3>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="bg-terminal text-black hover:bg-terminal/80">
          <Plus className="mr-1 size-3.5" /> Create Key
        </Button>
      </div>

      <div className="space-y-2">
        {keys.map((key) => (
          <div key={key.id} className="flex items-center gap-4 border border-border/50 bg-card p-3">
            <Key className="size-4 text-muted-foreground" weight="duotone" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{key.name}</p>
              <div className="flex gap-3 font-mono text-[10px] text-muted-foreground">
                <span>{key.maskedKey}</span>
                <span>Created: <RelativeTime date={key.createdAt} /></span>
                {key.lastUsedAt && <span>Last used: <RelativeTime date={key.lastUsedAt} /></span>}
              </div>
            </div>
            <CopyButton text={key.maskedKey} />
            <Button variant="ghost" size="icon-xs" onClick={() => setRevokeId(key.id)} className="text-muted-foreground hover:text-destructive">
              <Trash className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-sm uppercase tracking-wider">Create API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase">Key Name</Label>
            <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g. Production" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-terminal text-black hover:bg-terminal/80">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!revokeId}
        onOpenChange={(open) => !open && setRevokeId(null)}
        title="Revoke API Key"
        description="This key will be permanently revoked and cannot be used again."
        confirmLabel="Revoke"
        variant="destructive"
        onConfirm={handleRevoke}
      />
    </div>
  )
}
