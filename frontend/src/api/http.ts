import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/utils/env'
import { queryClient } from '@/api/query-client'
import { refreshApi } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/stores/authStore'

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

const AUTH_SKIP_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh']

function shouldSkipRefresh(url?: string) {
  if (!url) return false
  return AUTH_SKIP_REFRESH_PATHS.some((path) => url.includes(path))
}

let refreshPromise: Promise<string> | null = null

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken, setSession } = useAuthStore.getState()
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const result = await refreshApi(refreshToken)
      setSession(result.accessToken, result.refreshToken, result.user)
      return result.accessToken
    })().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined
    const blockedMessage =
      error.response?.status === 403 &&
      (error.response.data as { error?: string } | undefined)?.error ===
        'Аккаунт заблокирован'

    if (blockedMessage) {
      const { clearSession } = useAuthStore.getState()
      clearSession('expired')
      queryClient.clear()
      return Promise.reject(error)
    }

    if (!config || config._retry || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    if (shouldSkipRefresh(config.url)) {
      return Promise.reject(error)
    }

    const { refreshToken, clearSession } = useAuthStore.getState()

    if (!refreshToken) {
      clearSession('expired')
      queryClient.clear()
      return Promise.reject(error)
    }

    try {
      config._retry = true
      const accessToken = await refreshAccessToken()
      config.headers.Authorization = `Bearer ${accessToken}`
      return http(config)
    } catch {
      clearSession('expired')
      queryClient.clear()
      return Promise.reject(error)
    }
  },
)

export function getApiErrorMessage(error: unknown, fallback = 'Что-то пошло не так'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined
    if (data?.error) return data.error
    if (data?.message) return data.message
  }
  if (error instanceof Error) return error.message
  return fallback
}
