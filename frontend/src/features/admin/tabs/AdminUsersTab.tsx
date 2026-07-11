import { Ban, Mail } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandLoader } from '@/components/brand/BrandLoader'
import { Badge } from '@/components/ui/Badge/Badge'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
import {
  useAdminUsersQuery,
  useBlockAdminUserMutation,
  useUnblockAdminUserMutation,
} from '@/features/admin/api/useAdminQueries'
import { AdminListRow } from '@/features/admin/components/AdminListRow/AdminListRow'
import { AdminToolbar } from '@/features/admin/components/AdminToolbar/AdminToolbar'
import { AdminUserRoleSelect } from '@/features/admin/components/AdminUserRoleSelect/AdminUserRoleSelect'
import { getRoleLabel } from '@/features/admin/constants'
import type { AdminUsersFilter } from '@/features/admin/types/admin.types'
import type { UserRole } from '@/features/auth/types/auth.types'
import { useAuthStore } from '@/stores/authStore'
import { isAdminRole, isSuperadminRole } from '@/utils/roles'
import styles from './AdminTab.module.css'

const USER_FILTER_OPTIONS: Array<{ value: AdminUsersFilter; label: string }> = [
  { value: 'ALL', label: 'Все' },
  { value: 'user', label: getRoleLabel('user') },
  { value: 'admin', label: getRoleLabel('admin') },
  { value: 'superadmin', label: getRoleLabel('superadmin') },
  { value: 'blocked', label: 'Заблокированные' },
]

function toUsersQueryFilters(filter: AdminUsersFilter, search: string) {
  return {
    search,
    role: filter === 'blocked' ? ('ALL' as const) : filter,
    blocked: filter === 'blocked' ? ('blocked' as const) : ('ALL' as const),
  }
}

function canManageBlock(
  currentUserId: string | undefined,
  target: { id: string; role: UserRole },
): boolean {
  if (!currentUserId) return false
  if (target.id === currentUserId) return false
  if (target.role === 'superadmin') return false
  return true
}

export function AdminUsersTab() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.user)
  const isSuperadmin = currentUser ? isSuperadminRole(currentUser.role) : false
  const canModerate = currentUser ? isAdminRole(currentUser.role) : false
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<AdminUsersFilter>('ALL')
  const blockMutation = useBlockAdminUserMutation()
  const unblockMutation = useUnblockAdminUserMutation()
  const { data, isLoading, isError } = useAdminUsersQuery(toUsersQueryFilters(filter, search))

  if (isLoading && !data) {
    return <BrandLoader label="Загрузка пользователей…" />
  }

  if (isError) {
    return (
      <Card className={styles.state}>
        <p className={styles.stateText}>Не удалось загрузить список пользователей.</p>
      </Card>
    )
  }

  const users = data ?? []

  return (
    <>
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Поиск по имени или email…"
        searchAriaLabel="Поиск пользователей"
        filterOptions={USER_FILTER_OPTIONS}
        filterValue={filter}
        onFilterChange={setFilter}
        filterAriaLabel="Фильтр пользователей"
      />

      <div className={styles.listHeader}>
        <span className={styles.totalCount}>
          Всего: <strong>{users.length}</strong>
        </span>
      </div>

      {users.length ? (
        <div className={styles.list}>
          {users.map((user) => {
            const canBlock = canManageBlock(currentUser?.id, user)
            const blockPending = blockMutation.isPending || unblockMutation.isPending

            return (
              <AdminListRow
                key={user.id}
                isBlocked={user.isBlocked}
                thumb={
                  user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" />
                  ) : (
                    <span className={styles.avatarFallback} aria-hidden>
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )
                }
                title={user.name}
                onTitleClick={() => navigate(`/profile/${user.id}`)}
                meta={
                  <>
                    <div className={styles.titleRow}>
                      {user.isBlocked ? <Ban size={14} aria-hidden /> : null}
                      <Badge tone="neutral">{getRoleLabel(user.role)}</Badge>
                      {user.isBlocked ? (
                        <Badge tone="danger">Заблокирован</Badge>
                      ) : null}
                    </div>
                    <div className={styles.metaLine}>
                      <Mail size={14} aria-hidden />
                      {user.email}
                    </div>
                  </>
                }
                actions={
                  canModerate ? (
                    <div className={styles.userActions}>
                      {isSuperadmin ? (
                        <AdminUserRoleSelect
                          userId={user.id}
                          role={user.role}
                          disabled={user.id === currentUser?.id}
                        />
                      ) : null}
                      <Button
                        variant={user.isBlocked ? 'secondary' : 'ghost'}
                        size="sm"
                        disabled={!canBlock || blockPending}
                        aria-label={
                          user.isBlocked
                            ? `Разблокировать пользователя ${user.name}`
                            : `Заблокировать пользователя ${user.name}`
                        }
                        onClick={() =>
                          user.isBlocked
                            ? void unblockMutation.mutateAsync(user.id)
                            : void blockMutation.mutateAsync(user.id)
                        }
                      >
                        {user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                      </Button>
                    </div>
                  ) : null
                }
              />
            )
          })}
        </div>
      ) : (
        <Card className={styles.state}>
          <p className={styles.stateText}>Пользователи не найдены.</p>
        </Card>
      )}
    </>
  )
}
