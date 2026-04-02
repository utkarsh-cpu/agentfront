import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { authService } from '@/services/auth.service'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/validations'

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setFormError(null)
    try {
      await authService.forgotPassword(data.email)
      setSent(true)
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to send reset email',
      )
    }
  }

  if (sent) {
    return (
      <div className="space-y-8 text-center">
        {/* Mail icon — simple ASCII style */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center border border-terminal/30 bg-terminal/10">
          <span className="font-mono text-2xl text-terminal">✉</span>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
            CHECK YOUR EMAIL
          </h2>
          <p className="mt-3 font-mono text-sm leading-relaxed text-white/50">
            We sent a password reset link to{' '}
            <span className="text-terminal">{getValues('email')}</span>.
            <br />
            Check your inbox and follow the instructions.
          </p>
        </div>

        <Link
          to="/login"
          className="inline-block font-mono text-sm text-terminal/70 transition-colors hover:text-terminal"
        >
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
          RESET PASSWORD
        </h2>
        <p className="mt-1 font-mono text-sm text-white/40">
          Enter your email to receive a reset link
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
            htmlFor="email"
            className="font-mono text-xs uppercase tracking-wider text-white/60"
          >
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
            <p className="font-mono text-xs text-red-400">
              {errors.email.message}
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
              SENDING...
            </span>
          ) : (
            'SEND RESET LINK'
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
