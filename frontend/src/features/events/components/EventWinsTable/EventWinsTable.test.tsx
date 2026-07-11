import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EventWinsTable } from '@/features/events/components/EventWinsTable/EventWinsTable'

describe('EventWinsTable', () => {
  it('shows empty state', () => {
    render(<EventWinsTable winners={[]} />)
    expect(screen.getByText('Победители ещё не назначены.')).toBeInTheDocument()
  })

  it('renders winners table rows', () => {
    render(
      <EventWinsTable
        winners={[
          { type: 'user', userId: 'user-1', name: 'Марина', count: 1 },
          {
            type: 'guest',
            guestId: 'guest-1',
            name: 'Аня',
            hostName: 'Марина',
            count: 2,
          },
        ]}
      />,
    )

    expect(screen.getByRole('columnheader', { name: 'Игрок' })).toBeInTheDocument()
    expect(screen.getByText('Марина')).toBeInTheDocument()
    expect(screen.getByText('Аня (гость Марина)')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
