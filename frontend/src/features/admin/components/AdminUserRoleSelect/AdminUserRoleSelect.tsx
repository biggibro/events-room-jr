import { useCallback } from 'react'
import { Select } from '@/components/ui/Select/Select'
import { useAssignAdminUserRoleMutation } from '@/features/admin/api/useAdminQueries'
import { getRoleLabel } from '@/features/admin/constants'
import type { UserRole } from '@/features/auth/types/auth.types'
import type { AssignableUserRole } from '@/features/admin/api/admin.api'

const ASSIGNABLE_ROLES: AssignableUserRole[] = ['user', 'admin']

type AdminUserRoleSelectProps = {
  userId: string
  role: UserRole
  disabled?: boolean
}

export function AdminUserRoleSelect({
  userId,
  role,
  disabled = false,
}: AdminUserRoleSelectProps) {
  const mutation = useAssignAdminUserRoleMutation()
  const isPending = mutation.isPending

  const handleChange = useCallback(
    async (nextRole: AssignableUserRole) => {
      if (nextRole === role) return
      await mutation.mutateAsync({ userId, role: nextRole })
    },
    [mutation, role, userId],
  )

  if (role === 'superadmin') {
    return (
      <Select selectSize="sm" value="superadmin" disabled aria-label="Роль superadmin">
        <option value="superadmin">{getRoleLabel('superadmin')}</option>
      </Select>
    )
  }

  return (
    <Select
      selectSize="sm"
      value={role}
      disabled={disabled || isPending}
      aria-label="Изменить роль пользователя"
      onChange={(event) => void handleChange(event.target.value as AssignableUserRole)}
    >
      {ASSIGNABLE_ROLES.map((option) => (
        <option key={option} value={option}>
          {getRoleLabel(option)}
        </option>
      ))}
    </Select>
  )
}
