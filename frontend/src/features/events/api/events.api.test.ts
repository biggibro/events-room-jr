import { describe, expect, it } from 'vitest'
import { getEvents } from '@/features/events/api/events.api'

describe('events.api', () => {
  it('fetches events list', async () => {
    const events = await getEvents({
      search: '',
      status: 'ALL',
      sort: 'newest',
    })

    expect(events).toHaveLength(1)
    expect(events[0].title).toBe('Игровой вечер — октябрь')
  })
})
