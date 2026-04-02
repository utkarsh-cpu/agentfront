import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { ModelPicker } from "@/components/agents/ModelPicker"
import { AgentToolSelector } from "@/components/agents/AgentToolSelector"
import { agentsService } from "@/services/agents.service"
import { useAgentStore } from "@/stores/agent.store"

const createAgentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(1, "Description is required"),
  model: z.string().min(1, "Select a model"),
  systemPrompt: z.string().min(1, "System prompt is required"),
  tools: z.array(z.string()),
})

type FormData = z.infer<typeof createAgentSchema>

const steps = ["Name & Description", "Model", "System Prompt", "Tools", "Review"]

export function CreateAgentPage() {
  const navigate = useNavigate()
  const addAgent = useAgentStore((s) => s.addAgent)
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = useForm<FormData>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: { name: "", description: "", model: "gpt-4o", systemPrompt: "", tools: [] },
  })

  const values = watch()

  const nextStep = async () => {
    const fieldsToValidate: (keyof FormData)[][] = [
      ["name", "description"],
      ["model"],
      ["systemPrompt"],
      ["tools"],
    ]
    if (step < 4) {
      const valid = await trigger(fieldsToValidate[step])
      if (valid) setStep(step + 1)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitError("")
    try {
      const agent = await agentsService.createAgent(data)
      addAgent(agent)
      navigate(`/agents/${agent.id}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create agent")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Create Agent</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">Configure a new AI agent</p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-1">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => i < step && setStep(i)}
            className={cn(
              "flex-1 border-t-2 pt-2 text-left font-mono text-[10px] uppercase tracking-wider transition-colors",
              i === step ? "border-terminal text-terminal" : i < step ? "border-terminal/40 text-muted-foreground cursor-pointer" : "border-border text-muted-foreground/50"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-heading text-sm uppercase tracking-wider">{steps[step]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase">Name</Label>
                  <Input {...register("name")} placeholder="My Agent" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase">Description</Label>
                  <Textarea {...register("description")} placeholder="What does this agent do?" rows={3} />
                  {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                </div>
              </>
            )}

            {step === 1 && (
              <ModelPicker value={values.model} onChange={(v) => setValue("model", v)} />
            )}

            {step === 2 && (
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase">System Prompt</Label>
                <Textarea {...register("systemPrompt")} placeholder="You are a helpful assistant..." rows={8} className="font-mono text-xs" />
                {errors.systemPrompt && <p className="text-xs text-destructive">{errors.systemPrompt.message}</p>}
              </div>
            )}

            {step === 3 && (
              <AgentToolSelector selected={values.tools} onChange={(t) => setValue("tools", t)} />
            )}

            {step === 4 && (
              <div className="space-y-3 font-mono text-xs">
                <div><span className="text-muted-foreground">Name:</span> {values.name}</div>
                <div><span className="text-muted-foreground">Description:</span> {values.description}</div>
                <div><span className="text-muted-foreground">Model:</span> {values.model}</div>
                <div><span className="text-muted-foreground">System Prompt:</span> <span className="line-clamp-3">{values.systemPrompt}</span></div>
                <div><span className="text-muted-foreground">Tools:</span> {values.tools.join(", ") || "None"}</div>
                {submitError && <p className="text-destructive">{submitError}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 flex justify-between">
          <Button type="button" variant="ghost" onClick={() => step > 0 ? setStep(step - 1) : navigate("/agents")} disabled={isSubmitting}>
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < 4 ? (
            <Button type="button" onClick={nextStep} className="bg-terminal text-black hover:bg-terminal/80">
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting} className="bg-terminal text-black hover:bg-terminal/80">
              {isSubmitting ? "Creating..." : "Create Agent"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
