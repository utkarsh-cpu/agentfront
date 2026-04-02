import { useState } from "react"
import { Label } from "@workspace/ui/components/label"
import { Slider } from "@workspace/ui/components/slider"
import { Input } from "@workspace/ui/components/input"
import { Switch } from "@workspace/ui/components/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Button } from "@workspace/ui/components/button"

export function ModelPreferences() {
  const [model, setModel] = useState("gpt-4o")
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [streaming, setStreaming] = useState(true)

  return (
    <div className="max-w-md space-y-6">
      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase tracking-wider">Default Model</Label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
            <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
            <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase tracking-wider">
          Temperature: {temperature.toFixed(2)}
        </Label>
        <Slider value={[temperature]} onValueChange={([v]) => setTemperature(v)} min={0} max={2} step={0.01} />
      </div>

      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase tracking-wider">Max Tokens</Label>
        <Input type="number" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} min={1} max={128000} />
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={streaming} onCheckedChange={setStreaming} />
        <Label className="font-mono text-xs uppercase tracking-wider">Enable Streaming</Label>
      </div>

      <Button className="bg-terminal text-black hover:bg-terminal/80">Save Preferences</Button>
    </div>
  )
}
