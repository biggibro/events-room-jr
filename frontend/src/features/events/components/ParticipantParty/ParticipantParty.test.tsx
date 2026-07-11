import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ParticipantParty } from '@/features/events/components/ParticipantParty/ParticipantParty'

const participant = {
  userId: 'user-1',
  name: 'Super Admin',
  avatarUrl: '',
  note: 'С гостем',
  guestNames: ['Валерон'],
}

describe('ParticipantParty', () => {
  it('renders guest initial in avatar stack', () => {
    render(
      <ParticipantParty
        participant={participant}
        fallbackAvatarUrl="https://example.com/avatar.jpg"
      />,
    )

    expect(screen.getByText('Super Admin')).toBeInTheDocument()
    expect(screen.getByText('В')).toBeInTheDocument()
    expect(screen.getByText('Валерон')).toBeInTheDocument()
    expect(screen.queryByText('С гостем')).not.toBeInTheDocument()
    expect(screen.queryByText(/Гости:/)).not.toBeInTheDocument()
  })

  it('shows full guest names for up to four guests', () => {
    render(
      <ParticipantParty
        participant={{
          ...participant,
          guestNames: ['Валерон', 'Аня', 'Петя', 'Маша'],
        }}
        fallbackAvatarUrl="https://example.com/avatar.jpg"
      />,
    )

    expect(screen.getByText('+2')).toBeInTheDocument()
    expect(screen.getByText('Валерон, Аня, Петя, Маша')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /ещё/i })).not.toBeInTheDocument()
  })

  it('opens popover with all guest names when list is truncated', async () => {
    const user = userEvent.setup()

    render(
      <ParticipantParty
        participant={{
          ...participant,
          guestNames: ['Валерон', 'Аня', 'Петя', 'Маша', 'Олег'],
        }}
        fallbackAvatarUrl="https://example.com/avatar.jpg"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'и ещё 3' }))

    expect(screen.getByRole('dialog', { name: 'Список гостей' })).toBeInTheDocument()
    expect(screen.getByText('Олег')).toBeInTheDocument()
    expect(screen.getByText('Петя')).toBeInTheDocument()
    expect(screen.getByText('Маша')).toBeInTheDocument()
  })

  it('opens popover from overflow badge for many guests', async () => {
    const user = userEvent.setup()

    render(
      <ParticipantParty
        participant={{
          ...participant,
          guestNames: ['Валерон', 'Аня', 'Петя', 'Маша', 'Олег'],
        }}
        fallbackAvatarUrl="https://example.com/avatar.jpg"
      />,
    )

    await user.click(screen.getByRole('button', { name: /Показать всех гостей/i }))

    expect(screen.getByRole('dialog', { name: 'Список гостей' })).toBeInTheDocument()
    expect(screen.getByText('Олег')).toBeInTheDocument()
  })
})
