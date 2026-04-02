import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { authService } from '@/services/auth.service'
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/validations'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  // Redirect to login after success
  useEffect(() => {
    if (!success) return
    const timeout = setTimeout(() => navigate('/login', { replace: true }), 3000)
    return () => clearTimeout(timeout)
  }, [success, navigate])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setFormError(null)
    try {
      await authService.resetPassword(token, data.password)
      setSuccess(true)
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to reset password',
      )
    }
  }

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
          INVALID LINK
        </h2>
        <p className="font-mono text-sm text-white/50">
          This password reset link is invalid or has expired.
        </p>
        <Link
          to="/forgot-password"
          className="inline-block font-mono text-sm text-terminal/70 transition-colors hover:text-terminal"
        >
          Request a new link →
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="space-y-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center border border-terminal/30 bg-terminal/10">
          <span className="font-mono text-2xl text-terminal">✓</span>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
            PASSWORD RESET
          </h2>
          <p className="mt-3 font-mono text-sm leading-relaxed text-white/50">
            Your password has been updated successfully.
            <br />
            Redirecting to sign in...
          </p>
        </div>

        <div className="mx-auto h-1 w-32 overflow-hidden bg-white/10">
          <div className="h-full animate-[shrink_3s_linear] bg-terminal" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
          NEW PASSWORD
        </h2>
        <p className="mt-1 font-mono text-sm text-white/40">
          Choose a new password for your account
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
          <Label
            htmlFor="password"
            className="font-mono text-xs uppercase tracking-wider text-white/60"
          >
            New Password
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
          {errors.password && (
            <p className="font-mono text-xs text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="font-mono text-xs uppercase tracking-wider text-white/60"
          >
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
            <p className="font-mono text-xs text-red-400">
              {errors.confirmPassword.message}
            </p>
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
              RESETTING...
            </span>
          ) : (
            'SET NEW PASSWORD'
          )}
        </Button>
      </form>

      <Link
        to="/login"
        className="block text-center font-mono text-sm text-terminal/70 transition-colors hover:text-terminal"
      >
        ← Back to sign in
      </Link>
    </div>
  )
}
