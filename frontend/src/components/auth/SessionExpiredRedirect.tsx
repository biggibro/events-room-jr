import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function SessionExpiredRedirect() {
  const logoutReason = useAuthStore((state) => state.logoutReason)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (logoutReason !== 'expired') return
    if (location.pathname === '/login' || location.pathname === '/register') return

    navigate('/login', {
      replace: true,
      state: {
        reason: 'expired',
        from: { pathname: location.pathname },
      },
    })
  }, [logoutReason, location.pathname, navigate])

  return null
}
