import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { JoinEventModal } from '@/features/events/components/JoinEventModal/JoinEventModal'
import type { EventDetail } from '@/features/events/types/event.types'

const event: EventDetail = {
  id: 'evt-1',
  title: 'Игровой вечер',
  description: 'Описание',
  eventDate: '2026-10-24',
  eventTime: '19:00',
  location: 'Level-Up Lounge',
  locationAddress: 'ул. Примерная, 12',
  locationId: 'loc-1',
  maxParticipants: 6,
  currentParticipants: 2,
  imageUrl: 'https://example.com/image.jpg',
  status: 'registration_open',
  seatingType: 'random',
  durationHours: 4,
  participants: [],
}

describe('JoinEventModal', () => {
  it('submits without guests', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <JoinEventModal
        open
        event={event}
        mode="join"
        onConfirm={onConfirm}
        onCancel={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Записаться' }))

    expect(onConfirm).toHaveBeenCalledWith([])
  })

  it('submits with guest names', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <JoinEventModal
        open
        event={event}
        mode="join"
        onConfirm={onConfirm}
        onCancel={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Добавить гостя' }))
    await user.type(screen.getByLabelText('Гость 1'), 'Аня')
    await user.click(screen.getByRole('button', { name: 'Добавить гостя' }))
    await user.type(screen.getByLabelText('Гость 2'), 'Петя')
    await user.click(screen.getByRole('button', { name: 'Записаться' }))

    expect(onConfirm).toHaveBeenCalledWith(['Аня', 'Петя'])
  })

  it('prefills guests in edit mode', () => {
    render(
      <JoinEventModal
        open
        event={event}
        mode="edit"
        userId="user-1"
        initialGuestNames={['Маша']}
        onConfirm={() => undefined}
        onCancel={() => undefined}
      />,
    )

    expect(screen.getByLabelText('Гость 1')).toHaveValue('Маша')
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeInTheDocument()
  })

  it('disables submit when not enough slots', async () => {
    const user = userEvent.setup()

    render(
      <JoinEventModal
        open
        event={{ ...event, maxParticipants: 3, currentParticipants: 2 }}
        mode="join"
        onConfirm={() => undefined}
        onCancel={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Добавить гостя' }))
    await user.type(screen.getByLabelText('Гость 1'), 'Аня')
    await user.click(screen.getByRole('button', { name: 'Добавить гостя' }))
    await user.type(screen.getByLabelText('Гость 2'), 'Петя')

    expect(screen.getByRole('button', { name: 'Записаться' })).toBeDisabled()
  })
})
