import axios from 'axios'
import { http } from '@/api/http'
import { API_BASE_URL } from '@/utils/env'
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '@/features/auth/types/auth.types'

type AuthResponse = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

type RefreshResponse = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export async function loginApi(payload: LoginPayload): Promise<{
  accessToken: string
  refreshToken: string
  user: AuthUser
}> {
  const { data } = await http.post<AuthResponse>('/auth/login', payload)
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  }
}

export async function registerApi(payload: RegisterPayload): Promise<{
  accessToken: string
  refreshToken: string
  user: AuthUser
}> {
  const { data } = await http.post<AuthResponse>('/auth/register', payload)
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  }
}

export async function refreshApi(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
  user: AuthUser
}> {
  const { data } = await axios.post<RefreshResponse>(`${API_BASE_URL}/auth/refresh`, {
    refreshToken,
  })
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  }
}

export async function getMeApi(): Promise<AuthUser> {
  const { data } = await http.get<AuthUser>('/me')
  return data
}
