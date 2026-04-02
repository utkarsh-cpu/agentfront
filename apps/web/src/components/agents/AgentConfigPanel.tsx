import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Slider } from "@workspace/ui/components/slider"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { AgentToolSelector } from "./AgentToolSelector"
import { useState } from "react"
import type { Agent, UpdateAgentInput } from "@/types"

interface AgentConfigPanelProps {
  agent: Agent
  onSave?: (data: UpdateAgentInput) => void
}

export function AgentConfigPanel({ agent, onSave }: AgentConfigPanelProps) {
  const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt)
  const [model, setModel] = useState(agent.model)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [tools, setTools] = useState(agent.tools)

  const handleSave = () => {
    onSave?.({ systemPrompt, model, tools, temperature, maxTokens })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase tracking-wider">System Prompt</Label>
        <Textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={6}
          className="font-mono text-xs"
          placeholder="You are a helpful assistant..."
        />
      </div>

      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase tracking-wider">Model</Label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
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
        <Slider
          value={[temperature]}
          onValueChange={([v]) => setTemperature(v)}
          min={0}
          max={2}
          step={0.01}
        />
      </div>

      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase tracking-wider">Max Tokens</Label>
        <Input
          type="number"
          value={maxTokens}
          onChange={(e) => setMaxTokens(Number(e.target.value))}
          min={1}
          max={128000}
        />
      </div>

      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase tracking-wider">Tools</Label>
        <AgentToolSelector selected={tools} onChange={setTools} />
      </div>

      <Button onClick={handleSave} className="bg-terminal text-black hover:bg-terminal/80">
        Save Configuration
      </Button>
    </div>
  )
}
