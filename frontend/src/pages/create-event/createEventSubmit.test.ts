import { describe, expect, it, vi } from 'vitest'
import type { EventFormValues } from '@/features/events/types/event.types'
import {
  buildCreateEventPayload,
  submitCreateEvent,
} from '@/pages/create-event/createEventSubmit'

const baseValues: EventFormValues = {
  title: '  Новый вечер  ',
  description: '  Описание  ',
  eventDate: ' 2026-07-20 ',
  eventTime: ' 19:00 ',
  locationId: 'loc-1',
  maxParticipants: 16,
  seatingType: 'random',
  durationHours: 4,
  imageUrl: '  https://example.com/image.jpg  ',
  status: 'archived',
}

describe('buildCreateEventPayload', () => {
  it('trims text fields and omits empty image url', () => {
    expect(buildCreateEventPayload(baseValues)).toEqual({
      title: 'Новый вечер',
      description: 'Описание',
      eventDate: '2026-07-20',
      eventTime: '19:00',
      locationId: 'loc-1',
      maxParticipants: 16,
      seatingType: 'random',
      durationHours: 4,
      imageUrl: 'https://example.com/image.jpg',
    })
  })

  it('omits imageUrl when blank', () => {
    expect(
      buildCreateEventPayload({
        ...baseValues,
        imageUrl: '   ',
      }).imageUrl,
    ).toBeUndefined()
  })
})

describe('submitCreateEvent', () => {
  it('creates event and navigates without status update when archived', async () => {
    const createEvent = vi.fn().mockResolvedValue({ id: 'evt-new' })
    const updateEventStatus = vi.fn()
    const navigate = vi.fn()
    const onError = vi.fn()

    await submitCreateEvent(baseValues, {
      createEvent,
      updateEventStatus,
      navigate,
      onError,
    })

    expect(createEvent).toHaveBeenCalledWith(buildCreateEventPayload(baseValues))
    expect(updateEventStatus).not.toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith('/events/evt-new')
    expect(onError).not.toHaveBeenCalled()
  })

  it('updates status after create when status is not archived', async () => {
    const createEvent = vi.fn().mockResolvedValue({ id: 'evt-new' })
    const updateEventStatus = vi.fn().mockResolvedValue(undefined)
    const navigate = vi.fn()
    const onError = vi.fn()

    await submitCreateEvent(
      { ...baseValues, status: 'registration_open' },
      {
        createEvent,
        updateEventStatus,
        navigate,
        onError,
      },
    )

    expect(updateEventStatus).toHaveBeenCalledWith({
      eventId: 'evt-new',
      status: 'registration_open',
    })
    expect(navigate).toHaveBeenCalledWith('/events/evt-new')
    expect(onError).not.toHaveBeenCalled()
  })

  it('reports error when create fails', async () => {
    const createEvent = vi.fn().mockRejectedValue(new Error('Create failed'))
    const updateEventStatus = vi.fn()
    const navigate = vi.fn()
    const onError = vi.fn()

    await submitCreateEvent(baseValues, {
      createEvent,
      updateEventStatus,
      navigate,
      onError,
    })

    expect(updateEventStatus).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith('Create failed')
  })

  it('reports error when status update fails', async () => {
    const createEvent = vi.fn().mockResolvedValue({ id: 'evt-new' })
    const updateEventStatus = vi.fn().mockRejectedValue(new Error('Status failed'))
    const navigate = vi.fn()
    const onError = vi.fn()

    await submitCreateEvent(
      { ...baseValues, status: 'registration_open' },
      {
        createEvent,
        updateEventStatus,
        navigate,
        onError,
      },
    )

    expect(navigate).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith('Status failed')
  })
})
