import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth.store'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isLoading, refreshToken } = useAuthStore()

  useEffect(() => {
    refreshToken()
  }, [refreshToken])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-none border-2 border-terminal/30 border-t-terminal" />
          <p className="font-mono text-sm text-terminal/60">
            INITIALIZING NEXUS...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
