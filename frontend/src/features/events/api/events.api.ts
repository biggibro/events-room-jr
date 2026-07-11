import { http } from '@/api/http'
import type {
  CreateEventPayload,
  EditableEventStatus,
  EventDetail,
  EventListFilters,
  EventWinner,
  JoinEventPayload,
  PaginatedEventsResponse,
  RemoveParticipantsPayload,
  ReplaceWinnersPayload,
  UpdateEventPayload,
} from '@/features/events/types/event.types'

export async function getEvents(
  filters: EventListFilters,
): Promise<EventDetail[]> {
  const { data } = await http.get<EventDetail[]>('/events', {
    params: {
      search: filters.search || undefined,
      status: filters.status,
      sort: filters.sort,
    },
  })
  return data
}

export async function getEventsPage(
  filters: EventListFilters & { page: number; limit: number },
): Promise<PaginatedEventsResponse> {
  const { data } = await http.get<PaginatedEventsResponse>('/events', {
    params: {
      search: filters.search || undefined,
      status: filters.status,
      sort: filters.sort,
      page: filters.page,
      limit: filters.limit,
    },
  })
  return data
}

export async function getEventById(id: string): Promise<EventDetail | null> {
  try {
    const { data } = await http.get<EventDetail>(`/events/${id}`)
    return data
  } catch {
    return null
  }
}

export async function joinEvent(
  eventId: string,
  payload: JoinEventPayload = { guestNames: [] },
): Promise<EventDetail> {
  const { data } = await http.post<EventDetail>(`/events/${eventId}/join`, payload)
  return data
}

export async function leaveEvent(eventId: string): Promise<EventDetail> {
  const { data } = await http.delete<EventDetail>(`/events/${eventId}/join`)
  return data
}

export async function createEvent(payload: CreateEventPayload): Promise<EventDetail> {
  const { data } = await http.post<EventDetail>('/events', payload)
  return data
}

export async function updateEvent(
  eventId: string,
  payload: UpdateEventPayload,
): Promise<EventDetail> {
  const { data } = await http.patch<EventDetail>(`/events/${eventId}`, payload)
  return data
}

export async function updateEventStatus(
  eventId: string,
  status: EditableEventStatus,
): Promise<EventDetail> {
  const { data } = await http.patch<EventDetail>(`/events/${eventId}/status`, { status })
  return data
}

export async function archiveEvent(eventId: string): Promise<EventDetail> {
  const { data } = await http.patch<EventDetail>(`/events/${eventId}/archive`)
  return data
}

export async function removeParticipants(
  eventId: string,
  payload: RemoveParticipantsPayload,
): Promise<EventDetail> {
  const { data } = await http.delete<EventDetail>(`/events/${eventId}/participants`, {
    data: payload,
  })
  return data
}

export async function replaceWinners(
  eventId: string,
  payload: ReplaceWinnersPayload,
): Promise<EventWinner[]> {
  const { data } = await http.patch<EventWinner[]>(`/events/${eventId}/winners`, payload)
  return data
}
