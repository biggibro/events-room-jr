import { getRoleLabel } from '@/features/admin/constants'

export type SeedAccount = {
  role: string
  email: string
  password: string
}

export const SEED_ACCOUNTS: SeedAccount[] = [
  {
    role: 'superadmin',
    email: 'owner@example.com',
    password: 'password123',
  },
  {
    role: 'admin',
    email: 'admin@jackaroo.local',
    password: 'password123',
  },
  {
    role: 'user',
    email: 'player@jackaroo.local',
    password: 'password123',
  },
  {
    role: 'user',
    email: 'marina@jackaroo.local',
    password: 'password123',
  },
]

export function getSeedAccountRoleLabel(role: string): string {
  if (role === 'user' || role === 'admin' || role === 'superadmin') {
    return getRoleLabel(role)
  }
  return role
}
