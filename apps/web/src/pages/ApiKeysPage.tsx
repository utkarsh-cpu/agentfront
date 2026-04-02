import { ApiKeyManager } from "@/components/settings/ApiKeyManager"

export function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">API Keys</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">Manage your API keys for external integrations</p>
      </div>
      <ApiKeyManager />
    </div>
  )
}
