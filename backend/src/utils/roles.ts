import type { RoleName } from '@prisma/client'

const ADMIN_ROLES: RoleName[] = ['admin', 'superadmin']

export function isAdminRole(role: RoleName): boolean {
  return ADMIN_ROLES.includes(role)
}

export function isSuperadminRole(role: RoleName): boolean {
  return role === 'superadmin'
}

export function canManageAdminResources(role: RoleName): boolean {
  return isAdminRole(role)
}
