import { http } from '@/api/http'
import type { UserRole } from '@/features/auth/types/auth.types'
import type { AdminUserListItem, AdminUsersFilters } from '@/features/admin/types/admin.types'

export type AssignableUserRole = Extract<UserRole, 'admin' | 'user'>

export async function getAdminUsers(
  filters: AdminUsersFilters,
): Promise<AdminUserListItem[]> {
  const { data } = await http.get<AdminUserListItem[]>('/admin/users', {
    params: {
      search: filters.search || undefined,
      role: filters.role,
      blocked: filters.blocked,
    },
  })
  return data
}

export async function blockAdminUser(
  userId: string,
): Promise<AdminUserListItem> {
  const { data } = await http.post<AdminUserListItem>(`/admin/users/${userId}/block`)
  return data
}

export async function unblockAdminUser(
  userId: string,
): Promise<AdminUserListItem> {
  const { data } = await http.delete<AdminUserListItem>(`/admin/users/${userId}/block`)
  return data
}

export async function assignAdminUserRole(
  userId: string,
  role: AssignableUserRole,
): Promise<Pick<AdminUserListItem, 'id' | 'name' | 'email' | 'role'>> {
  const { data } = await http.patch<Pick<AdminUserListItem, 'id' | 'name' | 'email' | 'role'>>(
    `/admin/users/${userId}/role`,
    { role },
  )
  return data
}
