import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/features/auth/types/auth.types'

type ProtectedRouteProps = {
  children: ReactNode
  roles?: UserRole[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user)
  const logoutReason = useAuthStore((s) => s.logoutReason)
  const location = useLocation()

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          ...(logoutReason === 'expired' ? { reason: 'expired' as const } : {}),
        }}
      />
    )
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
