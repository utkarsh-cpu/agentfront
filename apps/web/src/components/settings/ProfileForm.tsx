import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
import { useAuthStore } from "@/stores/auth.store"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email(),
})

type ProfileData = z.infer<typeof profileSchema>

export function ProfileForm() {
  const user = useAuthStore((s) => s.user)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = async (_: ProfileData) => {
    // API call would go here
    await new Promise((r) => setTimeout(r, 500))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase tracking-wider">Name</Label>
        <Input {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase tracking-wider">Email</Label>
        <Input {...register("email")} disabled className="opacity-60" />
        <p className="font-mono text-[10px] text-muted-foreground">Email cannot be changed</p>
      </div>

      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase tracking-wider">Avatar</Label>
        <div className="flex h-20 w-20 items-center justify-center border border-dashed border-border bg-muted/10 font-mono text-xs text-muted-foreground">
          Upload
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="bg-terminal text-black hover:bg-terminal/80">
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
