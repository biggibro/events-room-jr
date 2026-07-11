import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { EventDetailsPage } from '@/pages/event-details/EventDetailsPage'
import { useAuthStore } from '@/stores/authStore'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/events/evt-1']}>
        <Routes>
          <Route path="/events/:eventId" element={<EventDetailsPage />} />
          <Route path="/events/:eventId/edit" element={<div>Edit page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('EventDetailsPage', () => {
  afterEach(() => {
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      logoutReason: null,
    })
  })

  it('opens join modal instead of joining immediately', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Записаться' }))

    expect(screen.getByRole('dialog', { name: 'Запись на событие' })).toBeInTheDocument()
  })

  it('shows edit icon only for admin', async () => {
    useAuthStore.setState({
      user: {
        id: 'admin-1',
        email: 'admin@jackaroo.local',
        name: 'Admin',
        avatarUrl: null,
        role: 'admin',
      },
    })

    renderPage()

    expect(
      await screen.findByRole('button', { name: 'Редактировать событие' }),
    ).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Итоги игры' })).toBeInTheDocument()
  })

  it('hides winners button for regular user', async () => {
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: 'player@jackaroo.local',
        name: 'Player',
        avatarUrl: null,
        role: 'user',
      },
    })

    renderPage()

    await screen.findByText('Игровой вечер — октябрь')
    expect(screen.queryByRole('button', { name: 'Итоги игры' })).not.toBeInTheDocument()
  })

  it('opens winners modal for admin', async () => {
    const user = userEvent.setup()
    useAuthStore.setState({
      user: {
        id: 'admin-1',
        email: 'admin@jackaroo.local',
        name: 'Admin',
        avatarUrl: null,
        role: 'admin',
      },
    })

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Итоги игры' }))
    expect(screen.getByRole('dialog', { name: 'Итоги игры' })).toBeInTheDocument()
  })

  it('hides edit icon for regular user', async () => {
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: 'player@jackaroo.local',
        name: 'Player',
        avatarUrl: null,
        role: 'user',
      },
    })

    renderPage()

    await screen.findByText('Игровой вечер — октябрь')
    expect(
      screen.queryByRole('button', { name: 'Редактировать событие' }),
    ).not.toBeInTheDocument()
  })

  it('opens location map link in a new tab', async () => {
    renderPage()

    const mapLink = await screen.findByRole('link', { name: 'Открыть на карте' })
    expect(mapLink).toHaveAttribute('href', 'https://yandex.ru/maps/-/CCUqY0V~')
    expect(mapLink).toHaveAttribute('target', '_blank')
    expect(mapLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
