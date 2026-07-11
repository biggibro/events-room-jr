import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AssignWinnersModal } from '@/features/events/components/AssignWinnersModal/AssignWinnersModal'
import type { EventDetail } from '@/features/events/types/event.types'

const event: EventDetail = {
  id: 'evt-1',
  title: 'Test',
  description: 'Desc',
  eventDate: '2026-10-24',
  eventTime: '19:00',
  location: 'Hall',
  locationId: 'loc-1',
  maxParticipants: 10,
  currentParticipants: 2,
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
  winners: [],
}

describe('AssignWinnersModal', () => {
  it('submits selected winners', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <AssignWinnersModal
        open
        event={event}
        onConfirm={onConfirm}
        onCancel={() => undefined}
      />,
    )

    await user.click(screen.getByRole('checkbox', { name: 'Марина' }))
    await user.click(screen.getByRole('checkbox', { name: 'Аня (гость Марина)' }))
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(onConfirm).toHaveBeenCalledWith([
      { userId: 'user-1', count: 1 },
      { guestId: 'guest-1', count: 1 },
    ])
  })
})
