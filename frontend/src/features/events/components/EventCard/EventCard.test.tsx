import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { EventCard } from '@/features/events/components/EventCard/EventCard'

const event = {
  id: 'evt-1',
  title: 'Игровой вечер — октябрь',
  description: 'Описание',
  eventDate: '2026-10-24',
  eventTime: '19:00',
  location: 'Level-Up Lounge',
  locationAddress: 'ул. Примерная, 12',
  locationId: 'loc-1',
  maxParticipants: 16,
  currentParticipants: 12,
  imageUrl: 'https://example.com/image.jpg',
  status: 'registration_open' as const,
  seatingType: 'random' as const,
  durationHours: 4,
}

describe('EventCard', () => {
  it('renders event title and location', () => {
    render(
      <MemoryRouter>
        <EventCard event={event} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Игровой вечер — октябрь')).toBeInTheDocument()
    expect(screen.getByText('Level-Up Lounge')).toBeInTheDocument()
  })
})
