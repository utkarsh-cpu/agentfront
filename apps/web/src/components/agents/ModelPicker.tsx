import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

const models = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", capabilities: ["reasoning", "vision", "code"], description: "Most capable OpenAI model" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", capabilities: ["fast", "code"], description: "Fast and efficient" },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", capabilities: ["reasoning", "code", "analysis"], description: "Balanced performance" },
  { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", capabilities: ["fast", "efficient"], description: "Fastest Anthropic model" },
]

interface ModelPickerProps {
  value: string
  onChange: (model: string) => void
}

export function ModelPicker({ value, onChange }: ModelPickerProps) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {models.map((model) => (
        <label
          key={model.id}
          className={cn(
            "flex cursor-pointer flex-col gap-2 border p-4 transition-colors",
            value === model.id ? "border-terminal/50 bg-terminal/5" : "border-border/50 hover:bg-muted/20"
          )}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value={model.id} id={model.id} />
            <div>
              <Label htmlFor={model.id} className="cursor-pointer text-sm font-medium">
                {model.name}
              </Label>
              <p className="font-mono text-[10px] text-muted-foreground">{model.provider}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{model.description}</p>
          <div className="flex flex-wrap gap-1">
            {model.capabilities.map((cap) => (
              <Badge key={cap} variant="secondary" className="rounded-none text-[9px] px-1.5 py-0">
                {cap}
              </Badge>
            ))}
          </div>
        </label>
      ))}
    </RadioGroup>
  )
}
