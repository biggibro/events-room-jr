import type { UserRole } from '@/features/auth/types/auth.types'

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  user: 'Игрок',
}

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role]
}
