import { Key } from "@phosphor-icons/react"
import { EmptyState } from "@/components/shared/EmptyState"

export function ApiKeyManager() {
  return (
    <EmptyState
      icon={<Key weight="duotone" />}
      title="No API Keys"
      description="API key management is not connected to a backend yet, so no placeholder keys are shown here."
    />
  )
}
