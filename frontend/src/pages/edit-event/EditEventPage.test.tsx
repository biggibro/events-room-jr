import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { EditEventPage } from '@/pages/edit-event/EditEventPage'
import { server } from '@/test/server'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/events/evt-1/edit']}>
        <Routes>
          <Route path="/events/:eventId/edit" element={<EditEventPage />} />
          <Route path="/events/:eventId" element={<div>Event details</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('EditEventPage', () => {
  it('submits updated event fields', async () => {
    const user = userEvent.setup()
    renderPage()

    const titleInput = await screen.findByLabelText('Название')
    await user.clear(titleInput)
    await user.type(titleInput, 'Обновлённый вечер')

    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    await waitFor(() => {
      expect(screen.getByText('Event details')).toBeInTheDocument()
    })
  })

  it('removes participant locally and sends batch delete on save', async () => {
    const user = userEvent.setup()
    let deletePayload: { userIds: string[] } | null = null

    let eventDetail = {
      id: 'evt-1',
      title: 'Игровой вечер — октябрь',
      description: 'Еженедельная встреча Jackaroo.',
      eventDate: '2026-10-24',
      eventTime: '19:00',
      location: 'Level-Up Lounge',
      locationAddress: 'ул. Примерная, 12',
      locationId: 'loc-1',
      maxParticipants: 16,
      currentParticipants: 2,
      imageUrl: 'https://example.com/image.jpg',
      status: 'registration_open' as const,
      seatingType: 'random' as const,
      durationHours: 4,
      participantUserIds: ['user-1'],
      participants: [
        {
          userId: 'user-1',
          name: 'Алексей',
          avatarUrl: '',
          note: 'Участник',
          guestNames: [],
        },
      ],
    }

    server.use(
      http.get('*/api/events/:id', () => HttpResponse.json(eventDetail)),
      http.delete('*/api/events/:id/participants', async ({ request }) => {
        deletePayload = (await request.json()) as { userIds: string[] }
        eventDetail = {
          ...eventDetail,
          currentParticipants: 0,
          participantUserIds: [],
          participants: [],
        }
        return HttpResponse.json(eventDetail)
      }),
    )

    renderPage()

    await screen.findByText('Алексей')
    await user.click(screen.getByRole('button', { name: 'Удалить' }))

    const removeDialog = screen.getByRole('alertdialog', { name: 'Удалить участника' })
    await user.click(within(removeDialog).getByRole('button', { name: 'Удалить' }))

    await waitFor(() => {
      expect(screen.getByText('Пока никто не записался.')).toBeInTheDocument()
    })

    expect(deletePayload).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    await waitFor(() => {
      expect(deletePayload).toEqual({ userIds: ['user-1'] })
      expect(screen.getByText('Event details')).toBeInTheDocument()
    })
  })

  it('asks for confirmation before archiving', async () => {
    const user = userEvent.setup()
    let archived = false

    server.use(
      http.patch('*/api/events/:id/archive', () => {
        archived = true
        return HttpResponse.json({
          id: 'evt-1',
          status: 'archived',
        })
      }),
    )

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'В архив' }))

    expect(archived).toBe(false)
    expect(screen.getByRole('alertdialog', { name: 'Архивировать событие' })).toBeInTheDocument()

    const archiveDialog = screen.getByRole('alertdialog', { name: 'Архивировать событие' })
    await user.click(within(archiveDialog).getByRole('button', { name: 'В архив' }))

    await waitFor(() => {
      expect(archived).toBe(true)
    })
  })
})
