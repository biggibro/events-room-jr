import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'

type GuestRouteProps = {
  children: ReactNode
}

export function GuestRoute({ children }: GuestRouteProps) {
  const user = useAuthStore((state) => state.user)

  if (user) {
    return <Navigate to="/events" replace />
  }

  return children
}
