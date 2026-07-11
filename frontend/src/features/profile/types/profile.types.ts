export type ProfileStats = {
  officialWins: number
  gamesPlayed: number
  winrate: string
}

export type PastEventBadge = 'win' | 'second' | 'other'

export type ProfileUpcomingEvent = {
  id: string
  title: string
  date: string
  time: string
  location: string
  locationAddress: string
  imageUrl: string
  status: 'registration_open' | 'registration_closed'
}

export type ProfilePastEvent = {
  id: string
  title: string
  date: string
  wins?: number
  badge: PastEventBadge
  imageUrl: string
}

export type UserProfile = {
  id: string
  email: string
  displayName: string
  tagline: string
  bio: string
  avatarUrl: string
  stats: ProfileStats
  pastEvents: ProfilePastEvent[]
  upcomingEvents: ProfileUpcomingEvent[]
}

export type UpdateProfilePayload = {
  name?: string
  tagline?: string
  bio?: string
}

export type UpdateCredentialsPayload = {
  email?: string
  currentPassword: string
  newPassword?: string
}
