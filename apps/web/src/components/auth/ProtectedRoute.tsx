import { useEffect, useRef } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, refreshToken } = useAuthStore()
  const attempted = useRef(false)

  useEffect(() => {
    if (!isAuthenticated && !attempted.current) {
      attempted.current = true
      refreshToken()
    }
  }, [isAuthenticated, refreshToken])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-none border-2 border-terminal/30 border-t-terminal" />
          <p className="font-mono text-sm text-terminal/60">
            VERIFYING ACCESS...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
