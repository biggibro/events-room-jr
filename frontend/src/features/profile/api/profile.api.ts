import { http } from '@/api/http'
import type {
  UpdateCredentialsPayload,
  UpdateProfilePayload,
  UserProfile,
} from '@/features/profile/types/profile.types'

const DEFAULT_AVATAR_URL =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop'

type MeResponse = {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  bio: string
  tagline: string
  role: string
}

type StatsResponse = {
  officialWins: number
  gamesPlayed: number
  winrate: string
  pastEvents: UserProfile['pastEvents']
  upcomingEvents: UserProfile['upcomingEvents']
}

type UserProfileResponse = MeResponse &
  StatsResponse & {
    email?: string
  }

function mapProfileResponse(data: UserProfileResponse): UserProfile {
  return {
    id: data.id,
    email: data.email ?? '',
    displayName: data.name,
    tagline: data.tagline || 'Игрок Jackaroo',
    bio: data.bio,
    avatarUrl: data.avatarUrl ?? DEFAULT_AVATAR_URL,
    stats: {
      officialWins: data.officialWins,
      gamesPlayed: data.gamesPlayed,
      winrate: data.winrate,
    },
    pastEvents: data.pastEvents,
    upcomingEvents: data.upcomingEvents,
  }
}

export async function getProfile(): Promise<UserProfile> {
  const [meResponse, statsResponse] = await Promise.all([
    http.get<MeResponse>('/me'),
    http.get<StatsResponse>('/me/stats'),
  ])

  return mapProfileResponse({
    ...meResponse.data,
    ...statsResponse.data,
  })
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data } = await http.get<UserProfileResponse>(`/users/${userId}/profile`)
  return mapProfileResponse(data)
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const { data } = await http.patch<MeResponse>('/me', payload)
  return data
}

export async function updateCredentials(payload: UpdateCredentialsPayload) {
  const { data } = await http.patch<MeResponse>('/me/credentials', payload)
  return data
}
