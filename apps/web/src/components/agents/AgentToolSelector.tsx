import { Checkbox } from "@workspace/ui/components/checkbox"
import { Label } from "@workspace/ui/components/label"
import {
  MagnifyingGlass,
  Code,
  File,
  PlugsConnected,
  ChartBar,
  Image,
} from "@phosphor-icons/react"

const tools = [
  { id: "web_search", label: "Web Search", description: "Search the web for real-time information", icon: MagnifyingGlass },
  { id: "code_execution", label: "Code Execution", description: "Execute code in a sandboxed environment", icon: Code },
  { id: "file_read", label: "File Read", description: "Read and process uploaded files", icon: File },
  { id: "api_call", label: "API Calls", description: "Make external HTTP API requests", icon: PlugsConnected },
  { id: "data_analysis", label: "Data Analysis", description: "Analyze and transform structured data", icon: ChartBar },
  { id: "image_generation", label: "Image Generation", description: "Generate images from text descriptions", icon: Image },
] as const

interface AgentToolSelectorProps {
  selected: string[]
  onChange: (tools: string[]) => void
}

export function AgentToolSelector({ selected, onChange }: AgentToolSelectorProps) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id])
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {tools.map((tool) => {
        const Icon = tool.icon
        const isChecked = selected.includes(tool.id)
        return (
          <label
            key={tool.id}
            className={`flex cursor-pointer items-start gap-3 border p-3 transition-colors ${
              isChecked ? "border-terminal/40 bg-terminal/5" : "border-border/50 hover:bg-muted/20"
            }`}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => toggle(tool.id)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" weight="duotone" />
                <Label className="cursor-pointer text-sm font-medium">{tool.label}</Label>
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{tool.description}</p>
            </div>
          </label>
        )
      })}
    </div>
  )
}
