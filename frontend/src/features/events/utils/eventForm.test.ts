import { describe, expect, it } from 'vitest'
import { validateEventForm } from '@/features/events/utils/eventForm'

describe('validateEventForm', () => {
  it('returns errors for empty required fields', () => {
    const errors = validateEventForm({
      title: '',
      description: '',
      eventDate: '',
      eventTime: '',
      locationId: '',
      maxParticipants: 0,
      seatingType: 'free',
      durationHours: 0,
      imageUrl: '',
      status: 'registration_open',
    })

    expect(errors.title).toBeDefined()
    expect(errors.description).toBeDefined()
    expect(errors.locationId).toBeDefined()
  })

  it('accepts valid form values', () => {
    const errors = validateEventForm({
      title: 'Игровой вечер',
      description: 'Описание',
      eventDate: '2026-10-24',
      eventTime: '19:00',
      locationId: 'loc-1',
      maxParticipants: 16,
      seatingType: 'random',
      durationHours: 4,
      imageUrl: 'https://example.com/image.jpg',
      status: 'registration_open',
    })

    expect(Object.keys(errors)).toHaveLength(0)
  })

  it('accepts local upload image URL', () => {
    const errors = validateEventForm({
      title: 'Игровой вечер',
      description: 'Описание',
      eventDate: '2026-10-24',
      eventTime: '19:00',
      locationId: 'loc-1',
      maxParticipants: 16,
      seatingType: 'random',
      durationHours: 4,
      imageUrl: '/uploads/events/draft-123.jpg',
      status: 'registration_open',
    })

    expect(errors.imageUrl).toBeUndefined()
  })
})
