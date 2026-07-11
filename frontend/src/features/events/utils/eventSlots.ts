import type { EventDetail } from '@/features/events/types/event.types'

export function getParticipantSlots(guestCount: number): number {
  return 1 + guestCount
}

export function getAvailableSlots(
  event: Pick<EventDetail, 'maxParticipants' | 'currentParticipants' | 'participants'>,
  userId?: string,
): number {
  const currentUserParticipant = userId
    ? event.participants?.find((participant) => participant.userId === userId)
    : undefined

  const currentUserSlots = currentUserParticipant
    ? getParticipantSlots(currentUserParticipant.guestNames.length)
    : 0

  const occupiedByOthers = event.currentParticipants - currentUserSlots
  return Math.max(0, event.maxParticipants - occupiedByOthers)
}

export function normalizeGuestNames(names: string[]): string[] {
  return names.map((name) => name.trim()).filter(Boolean)
}
