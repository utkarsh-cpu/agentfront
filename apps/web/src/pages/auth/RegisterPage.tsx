import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Separator } from '@workspace/ui/components/separator'
import { useAuthStore } from '@/stores/auth.store'
import { registerSchema, type RegisterFormData } from '@/lib/validations'

function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 1) return { score: 1, label: 'WEAK', color: 'bg-red-500' }
  if (score === 2) return { score: 2, label: 'FAIR', color: 'bg-orange-500' }
  if (score === 3) return { score: 3, label: 'STRONG', color: 'bg-yellow-500' }
  return { score: 4, label: 'VERY STRONG', color: 'bg-terminal' }
}

function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null

  const { score, label, color } = getPasswordStrength(password)

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 transition-colors',
              level <= score ? color : 'bg-white/10',
            )}
          />
        ))}
      </div>
      <p className={cn('font-mono text-xs', score <= 1 ? 'text-red-400' : score === 2 ? 'text-orange-400' : score === 3 ? 'text-yellow-400' : 'text-terminal')}>
        {label}
      </p>
    </div>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const registerUser = useAuthStore((s) => s.register)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setFormError(null)
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
          CREATE ACCOUNT
        </h2>
        <p className="mt-1 font-mono text-sm text-white/40">
          Register a new operator identity
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {formError && (
          <div className="rounded-none border border-red-500/40 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-400">
            <span className="mr-2 text-red-500">ERR:</span>
            {formError}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wider text-white/60">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Jane Operator"
            autoComplete="name"
            className={cn(
              'rounded-none border-white/10 bg-white/5 font-mono text-white placeholder:text-white/20 focus:border-terminal focus:ring-terminal/20',
              errors.name && 'border-red-500/60',
            )}
            {...register('name')}
          />
          {errors.name && (
            <p className="font-mono text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

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
            autoComplete="new-password"
            className={cn(
              'rounded-none border-white/10 bg-white/5 font-mono text-white placeholder:text-white/20 focus:border-terminal focus:ring-terminal/20',
              errors.password && 'border-red-500/60',
            )}
            {...register('password')}
          />
          <PasswordStrengthMeter password={password} />
          {errors.password && (
            <p className="font-mono text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="font-mono text-xs uppercase tracking-wider text-white/60">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className={cn(
              'rounded-none border-white/10 bg-white/5 font-mono text-white placeholder:text-white/20 focus:border-terminal focus:ring-terminal/20',
              errors.confirmPassword && 'border-red-500/60',
            )}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="font-mono text-xs text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-none bg-terminal font-mono text-sm font-semibold uppercase tracking-wider text-black hover:bg-terminal/90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin border-2 border-black/30 border-t-black" />
              CREATING ACCOUNT...
            </span>
          ) : (
            'CREATE ACCOUNT'
          )}
        </Button>
      </form>

      <Separator className="bg-white/10" />

      <p className="text-center font-mono text-sm text-white/40">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-terminal/80 transition-colors hover:text-terminal"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
