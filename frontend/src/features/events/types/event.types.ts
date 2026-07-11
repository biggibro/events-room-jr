export type EventStatus =
  | 'archived'
  | 'registration_open'
  | 'registration_closed'
  | 'completed'

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  archived: 'Архив',
  registration_open: 'Открыта регистрация',
  registration_closed: 'Закрыта регистрация',
  completed: 'Завершена',
}

export type EventListItem = {
  id: string
  title: string
  description: string
  eventDate: string
  eventTime: string
  location: string
  locationId: string
  maxParticipants: number
  currentParticipants: number
  imageUrl: string
  status: EventStatus
}

export type EventGuest = {
  id: string
  name: string
}

export type EventParticipant = {
  userId: string
  name: string
  avatarUrl: string
  note: string
  guestNames: string[]
  guests?: EventGuest[]
}

export type EventUserWinner = {
  type: 'user'
  userId: string
  name: string
  count: number
}

export type EventGuestWinner = {
  type: 'guest'
  guestId: string
  name: string
  hostName: string
  count: number
}

export type EventWinner = EventUserWinner | EventGuestWinner

export type WinnerInput =
  | { userId: string; count: number }
  | { guestId: string; count: number }

export type ReplaceWinnersPayload = {
  winners: WinnerInput[]
}

export type EventDetail = EventListItem & {
  seatingType: 'random' | 'free'
  durationHours: number
  locationAddress: string
  locationMapUrl: string | null
  participantUserIds?: string[]
  participants?: EventParticipant[]
  winners?: EventWinner[]
}

export type EventListFilters = {
  search: string
  status: EventStatus | 'ALL'
  sort: 'newest' | 'date'
}

export type PaginatedEventsResponse = {
  items: EventListItem[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export type JoinEventPayload = {
  guestNames: string[]
}

export type RemoveParticipantsPayload = {
  userIds: string[]
}

export type EventFormSubmitMeta = {
  removedParticipantIds: string[]
}

export type UpdateEventPayload = {
  title?: string
  description?: string
  eventDate?: string
  eventTime?: string
  locationId?: string
  maxParticipants?: number
  seatingType?: 'random' | 'free'
  durationHours?: number
  imageUrl?: string
}

export type CreateEventPayload = {
  title: string
  description: string
  eventDate: string
  eventTime: string
  locationId: string
  maxParticipants: number
  seatingType?: 'random' | 'free'
  durationHours?: number
  imageUrl?: string
}

export type EditableEventStatus = Exclude<EventStatus, 'archived'>

export type EventFormValues = {
  title: string
  description: string
  eventDate: string
  eventTime: string
  locationId: string
  maxParticipants: number
  seatingType: 'random' | 'free'
  durationHours: number
  imageUrl: string
  status: EventStatus
}
