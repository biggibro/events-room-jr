import { describe, expect, it } from 'vitest'
import {
  getAvailableSlots,
  getParticipantSlots,
  normalizeGuestNames,
} from '@/features/events/utils/eventSlots'

const event = {
  maxParticipants: 10,
  currentParticipants: 6,
  participants: [
    { userId: 'user-1', guestNames: ['Аня', 'Петя'] },
    { userId: 'user-2', guestNames: [] },
  ],
}

describe('eventSlots', () => {
  it('counts participant slots including the user', () => {
    expect(getParticipantSlots(0)).toBe(1)
    expect(getParticipantSlots(2)).toBe(3)
  })

  it('returns free slots for a new participant', () => {
    expect(getAvailableSlots(event)).toBe(4)
  })

  it('returns extra slots when editing current participant guests', () => {
    expect(getAvailableSlots(event, 'user-1')).toBe(7)
  })

  it('normalizes guest names', () => {
    expect(normalizeGuestNames([' Аня ', '', '  '])).toEqual(['Аня'])
  })
})
