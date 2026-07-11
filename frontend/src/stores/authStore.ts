import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '@/features/auth/api/auth.api'
import type { AuthUser } from '@/features/auth/types/auth.types'

export type LogoutReason = 'expired' | null

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  logoutReason: LogoutReason
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  clearSession: (reason?: 'expired') => void
  clearLogoutReason: () => void
  setSession: (accessToken: string, refreshToken: string, user: AuthUser) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      logoutReason: null,
      async login(email, password) {
        const { accessToken, refreshToken, user } = await authApi.loginApi({
          email,
          password,
        })
        set({ accessToken, refreshToken, user, logoutReason: null })
      },
      async register(name, email, password) {
        const { accessToken, refreshToken, user } = await authApi.registerApi({
          name,
          email,
          password,
        })
        set({ accessToken, refreshToken, user, logoutReason: null })
      },
      logout() {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          logoutReason: null,
        })
      },
      clearSession(reason) {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          logoutReason: reason ?? null,
        })
      },
      clearLogoutReason() {
        set({ logoutReason: null })
      },
      setSession(accessToken, refreshToken, user) {
        set({ accessToken, refreshToken, user, logoutReason: null })
      },
    }),
    {
      name: 'events-room-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)
