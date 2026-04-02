import { ProfileForm } from "@/components/settings/ProfileForm"

export function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">Manage your profile information</p>
      </div>
      <ProfileForm />
    </div>
  )
}
