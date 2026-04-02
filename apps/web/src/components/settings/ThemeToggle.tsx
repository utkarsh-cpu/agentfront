import { Sun, Moon, Monitor } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"

const themes = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex gap-2">
      {themes.map((t) => {
        const Icon = t.icon
        const isActive = theme === t.value
        return (
          <Button
            key={t.value}
            variant="outline"
            onClick={() => setTheme(t.value)}
            className={cn(
              "gap-2 rounded-none",
              isActive && "border-terminal bg-terminal/10 text-terminal"
            )}
          >
            <Icon className="size-4" weight={isActive ? "fill" : "regular"} />
            {t.label}
          </Button>
        )
      })}
    </div>
  )
}
