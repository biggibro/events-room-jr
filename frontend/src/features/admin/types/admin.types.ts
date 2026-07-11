import type { UserRole } from '@/features/auth/types/auth.types'

export type AdminUserListItem = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  role: UserRole
  isBlocked: boolean
}

export type AdminUsersFilter = UserRole | 'ALL' | 'blocked'

export type AdminUsersFilters = {
  search: string
  role: UserRole | 'ALL'
  blocked: 'ALL' | 'blocked'
}

export type AdminEventsFilters = {
  search: string
  status: import('@/features/events/types/event.types').EventStatus | 'ALL'
}
