import { User, Brain, Bell } from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { ProfileForm } from "@/components/settings/ProfileForm"
import { ModelPreferences } from "@/components/settings/ModelPreferences"
import { NotificationSettings } from "@/components/settings/NotificationSettings"
import { DangerZone } from "@/components/settings/DangerZone"
import { ThemeToggle } from "@/components/settings/ThemeToggle"

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="space-y-8">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-sm uppercase tracking-wider">
              <User className="size-4" weight="duotone" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-heading text-sm uppercase tracking-wider">Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-sm uppercase tracking-wider">
              <Brain className="size-4" weight="duotone" /> Model Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ModelPreferences />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-sm uppercase tracking-wider">
              <Bell className="size-4" weight="duotone" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationSettings />
          </CardContent>
        </Card>

        <DangerZone />
      </div>
    </div>
  )
}
