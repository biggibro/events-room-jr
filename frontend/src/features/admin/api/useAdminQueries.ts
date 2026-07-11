import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getEventsPage } from '@/features/events/api/events.api'
import type { EventListFilters } from '@/features/events/types/event.types'
import { useDebounce } from '@/hooks/useDebounce'
import * as adminApi from '@/features/admin/api/admin.api'
import type { AssignableUserRole } from '@/features/admin/api/admin.api'
import type { AdminUsersFilters } from '@/features/admin/types/admin.types'

export const ADMIN_EVENTS_PAGE_SIZE = 10

export function useAdminEventsInfiniteQuery(filters: EventListFilters) {
  const debouncedSearch = useDebounce(filters.search, 300)

  return useInfiniteQuery({
    queryKey: [
      'admin',
      'events',
      'infinite',
      { ...filters, search: debouncedSearch, limit: ADMIN_EVENTS_PAGE_SIZE },
    ],
    queryFn: ({ pageParam }) =>
      getEventsPage({
        ...filters,
        search: debouncedSearch,
        page: pageParam,
        limit: ADMIN_EVENTS_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    placeholderData: keepPreviousData,
  })
}

export function useAdminUsersQuery(filters: AdminUsersFilters) {
  const debouncedSearch = useDebounce(filters.search, 300)

  return useQuery({
    queryKey: ['admin', 'users', { ...filters, search: debouncedSearch }],
    queryFn: () => adminApi.getAdminUsers({ ...filters, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  })
}

export function useAssignAdminUserRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string
      role: AssignableUserRole
    }) => adminApi.assignAdminUserRole(userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useBlockAdminUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => adminApi.blockAdminUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useUnblockAdminUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => adminApi.unblockAdminUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}
