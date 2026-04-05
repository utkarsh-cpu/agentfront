import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Separator } from '@workspace/ui/components/separator'
import { useAuthStore } from '@/stores/auth.store'
import { loginSchema, type LoginFormData } from '@/lib/validations'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const rememberMe = watch('rememberMe')

  const onSubmit = async (data: LoginFormData) => {
    setFormError(null)
    try {
      await login({ email: data.email, password: data.password, rememberMe: data.rememberMe })
      navigate('/chat', { replace: true })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Authentication failed')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
          SIGN IN
        </h2>
        <p className="mt-1 font-mono text-sm text-white/40">
          Enter your credentials to access the system
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {formError && (
          <div className="rounded-none border border-red-500/40 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-400">
            <span className="mr-2 text-red-500">ERR:</span>
            {formError}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider text-white/60">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="operator@nexus.io"
            autoComplete="email"
            className={cn(
              'rounded-none border-white/10 bg-white/5 font-mono text-white placeholder:text-white/20 focus:border-terminal focus:ring-terminal/20',
              errors.email && 'border-red-500/60',
            )}
            {...register('email')}
          />
          {errors.email && (
            <p className="font-mono text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider text-white/60">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className={cn(
              'rounded-none border-white/10 bg-white/5 font-mono text-white placeholder:text-white/20 focus:border-terminal focus:ring-terminal/20',
              errors.password && 'border-red-500/60',
            )}
            {...register('password')}
          />
          {errors.password && (
            <p className="font-mono text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setValue('rememberMe', checked === true)}
              className="rounded-none border-white/20 data-[state=checked]:bg-terminal data-[state=checked]:text-black"
            />
            <Label htmlFor="rememberMe" className="cursor-pointer font-mono text-xs text-white/50">
              Remember me
            </Label>
          </div>
          <Link
            to="/forgot-password"
            className="font-mono text-xs text-terminal/70 transition-colors hover:text-terminal"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-none bg-terminal font-mono text-sm font-semibold uppercase tracking-wider text-black hover:bg-terminal/90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin border-2 border-black/30 border-t-black" />
              AUTHENTICATING...
            </span>
          ) : (
            'SIGN IN'
          )}
        </Button>
      </form>

      <Separator className="bg-white/10" />

      <p className="text-center font-mono text-sm text-white/40">
        No account?{' '}
        <Link
          to="/register"
          className="text-terminal/80 transition-colors hover:text-terminal"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
