import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as profileApi from '@/features/profile/api/profile.api'
import type {
  UpdateCredentialsPayload,
  UpdateProfilePayload,
} from '@/features/profile/types/profile.types'
import type { UserRole } from '@/features/auth/types/auth.types'
import { useAuthStore } from '@/stores/authStore'

export function useProfileQuery(userId?: string) {
  const user = useAuthStore((state) => state.user)
  const isOwnProfile = !userId || userId === user?.id

  return useQuery({
    queryKey: ['profile', userId ?? user?.id],
    queryFn: () =>
      isOwnProfile ? profileApi.getProfile() : profileApi.getUserProfile(userId!),
    enabled: Boolean(user) && (isOwnProfile || Boolean(userId)),
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const user = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.updateProfile(payload),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      if (accessToken && refreshToken && user) {
        setSession(accessToken, refreshToken, {
          ...user,
          name: result.name,
        })
      }
    },
  })
}

export function useUpdateCredentialsMutation() {
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const user = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: UpdateCredentialsPayload) =>
      profileApi.updateCredentials(payload),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      if (accessToken && refreshToken && user) {
        setSession(accessToken, refreshToken, {
          ...user,
          email: result.email,
          role: result.role as UserRole,
        })
      }
    },
  })
}
