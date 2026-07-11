export type UserRole = 'user' | 'admin' | 'superadmin'

export type AuthUser = {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: UserRole
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = LoginPayload & {
  name: string
}
