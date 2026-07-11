import { describe, expect, it } from 'vitest'
import type { EventDetail } from '@/features/events/types/event.types'
import {
  buildWinnerCandidates,
  buildWinnerPayload,
  buildWinnerSelectionFromEvent,
  formatWinnerLabel,
} from '@/features/events/utils/eventWinners'

const event: EventDetail = {
  id: 'evt-1',
  title: 'Test',
  description: 'Desc',
  eventDate: '2026-10-24',
  eventTime: '19:00',
  location: 'Hall',
  locationId: 'loc-1',
  maxParticipants: 10,
  currentParticipants: 3,
  imageUrl: '',
  status: 'registration_open',
  seatingType: 'free',
  durationHours: 3,
  locationAddress: 'Address',
  locationMapUrl: null,
  participants: [
    {
      userId: 'user-1',
      name: 'Марина',
      avatarUrl: '',
      note: 'С гостем',
      guestNames: ['Аня'],
      guests: [{ id: 'guest-1', name: 'Аня' }],
    },
  ],
  winners: [
    { type: 'user', userId: 'user-1', name: 'Марина', count: 1 },
    {
      type: 'guest',
      guestId: 'guest-1',
      name: 'Аня',
      hostName: 'Марина',
      count: 2,
    },
  ],
}

describe('eventWinners utils', () => {
  it('builds candidates for participants and guests', () => {
    expect(buildWinnerCandidates(event)).toEqual([
      { key: 'user:user-1', kind: 'user', userId: 'user-1', label: 'Марина' },
      {
        key: 'guest:guest-1',
        kind: 'guest',
        guestId: 'guest-1',
        label: 'Аня (гость Марина)',
      },
    ])
  })

  it('prefills selection from winners', () => {
    const candidates = buildWinnerCandidates(event)
    expect(buildWinnerSelectionFromEvent(event, candidates)).toEqual({
      'user:user-1': { selected: true, count: 1 },
      'guest:guest-1': { selected: true, count: 2 },
    })
  })

  it('builds payload from selection', () => {
    const candidates = buildWinnerCandidates(event)
    const selection = buildWinnerSelectionFromEvent(event, candidates)

    expect(buildWinnerPayload(candidates, selection)).toEqual([
      { userId: 'user-1', count: 1 },
      { guestId: 'guest-1', count: 2 },
    ])
  })

  it('formats guest label with host name', () => {
    expect(
      formatWinnerLabel({
        type: 'guest',
        guestId: 'guest-1',
        name: 'Аня',
        hostName: 'Марина',
        count: 2,
      }),
    ).toBe('Аня (гость Марина)')
  })
})
