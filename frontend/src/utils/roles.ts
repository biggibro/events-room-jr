import type { UserRole } from '@/features/auth/types/auth.types'

const ADMIN_ROLES: UserRole[] = ['admin', 'superadmin']

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role)
}

export function isSuperadminRole(role: UserRole): boolean {
  return role === 'superadmin'
}
