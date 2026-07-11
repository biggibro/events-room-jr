import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AdminPage } from '@/pages/admin/AdminPage'
import { EditLocationPage } from '@/pages/edit-location/EditLocationPage'
import { resetMockLocations } from '@/test/msw/handlers'
import { useAuthStore } from '@/stores/authStore'

function renderPage(locationId = 'loc-1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/admin/locations/${locationId}/edit`]}>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/locations/:locationId/edit" element={<EditLocationPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function setAdminSession() {
  useAuthStore.setState({
    accessToken: 'test-token',
    refreshToken: 'test-refresh',
    user: {
      id: 'admin-1',
      email: 'admin@jackaroo.local',
      name: 'Admin',
      avatarUrl: null,
      role: 'admin',
    },
  })
}

describe('EditLocationPage', () => {
  afterEach(() => {
    resetMockLocations()
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      logoutReason: null,
    })
  })

  it('prefills location form fields', async () => {
    setAdminSession()
    renderPage()

    expect(await screen.findByDisplayValue('Level-Up Lounge')).toBeInTheDocument()
    expect(screen.getByDisplayValue('ул. Примерная, 12')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Уютный зал для домашних турниров.')).toBeInTheDocument()
    expect(screen.getByDisplayValue('+7 (900) 123-45-67')).toBeInTheDocument()
  })

  it('saves updated location and returns to admin', async () => {
    const user = userEvent.setup()
    setAdminSession()
    renderPage()

    const nameInput = await screen.findByLabelText('Название')
    await user.clear(nameInput)
    await user.type(nameInput, 'Обновлённый зал')
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Админ-панель' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Локации' })).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('archives location from edit page', async () => {
    const user = userEvent.setup()
    setAdminSession()
    renderPage()

    await screen.findByLabelText('Название')
    await user.click(screen.getByRole('button', { name: 'В архив' }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'В архив' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Админ-панель' })).toBeInTheDocument()
    })
  })
})
