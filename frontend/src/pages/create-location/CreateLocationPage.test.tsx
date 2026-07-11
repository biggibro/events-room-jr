import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AdminPage } from '@/pages/admin/AdminPage'
import { CreateLocationPage } from '@/pages/create-location/CreateLocationPage'
import { resetMockLocations } from '@/test/msw/handlers'
import { useAuthStore } from '@/stores/authStore'

function renderAdminPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/locations/new" element={<CreateLocationPage />} />
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

describe('CreateLocationPage', () => {
  afterEach(() => {
    resetMockLocations()
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      logoutReason: null,
    })
  })

  it('renders location form fields', async () => {
    setAdminSession()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/admin/locations/new']}>
          <Routes>
            <Route path="/admin/locations/new" element={<CreateLocationPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Создание локации' })).toBeInTheDocument()
    expect(screen.getByLabelText('Название')).toBeInTheDocument()
    expect(screen.getByLabelText('Адрес')).toBeInTheDocument()
    expect(screen.getByLabelText('Телефон')).toBeInTheDocument()
    expect(screen.getByLabelText('Ссылка на карту')).toBeInTheDocument()
    expect(screen.getByLabelText('Текст')).toBeInTheDocument()
  })

  it('navigates from admin locations tab to create page', async () => {
    const user = userEvent.setup()
    setAdminSession()
    renderAdminPage()

    await user.click(screen.getByRole('tab', { name: 'Локации' }))
    await user.click(await screen.findByRole('button', { name: 'Создать локацию' }))

    expect(screen.getByRole('heading', { name: 'Создание локации' })).toBeInTheDocument()
  })

  it('creates location and returns to admin locations tab', async () => {
    const user = userEvent.setup()
    setAdminSession()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/admin/locations/new']}>
          <Routes>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/locations/new" element={<CreateLocationPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await user.type(screen.getByLabelText('Название'), 'Новый зал')
    await user.type(screen.getByLabelText('Адрес'), 'ул. Новая, 10')
    await user.type(screen.getByLabelText('Текст'), 'Описание нового зала')
    await user.click(screen.getByRole('button', { name: 'Создать' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Админ-панель' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Локации' })).toHaveAttribute('aria-selected', 'true')
    })
  })
})
