import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AdminPage } from '@/pages/admin/AdminPage'
import { resetMockAdminUsers } from '@/test/msw/handlers'
import { useAuthStore } from '@/stores/authStore'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/events/:eventId" element={<div>Event details</div>} />
          <Route path="/profile/:userId" element={<div>User profile</div>} />
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

describe('AdminPage', () => {
  afterEach(() => {
    resetMockAdminUsers()
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      logoutReason: null,
    })
  })

  it('renders tabs and events list by default', async () => {
    setAdminSession()
    renderPage()

    expect(screen.getByRole('heading', { name: 'Админ-панель' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'События' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(await screen.findByText('Игровой вечер — октябрь')).toBeInTheDocument()
    expect(screen.getByText('Всего:')).toBeInTheDocument()
    expect(screen.getByText('2 / 16 участников')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Редактировать событие' })).toBeInTheDocument()
    expect(screen.getByLabelText('Изменить статус события')).toBeInTheDocument()
  })

  it('opens event details when title is clicked', async () => {
    const user = userEvent.setup()
    setAdminSession()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Игровой вечер — октябрь' }))

    expect(screen.getByText('Event details')).toBeInTheDocument()
  })

  it('opens user profile when name is clicked', async () => {
    const user = userEvent.setup()
    setAdminSession()
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Пользователи' }))
    await user.click(await screen.findByRole('button', { name: 'Алексей' }))

    expect(screen.getByText('User profile')).toBeInTheDocument()
  })

  it('switches to users tab and filters by role', async () => {
    const user = userEvent.setup()
    setAdminSession()
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Пользователи' }))

    expect(await screen.findByText('Алексей')).toBeInTheDocument()
    expect(screen.getByText('Админ')).toBeInTheDocument()
    expect(screen.getAllByText('Игрок').length).toBeGreaterThan(0)
    expect(screen.getByText('Всего:')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Admin' }))

    expect(await screen.findByText('Админ')).toBeInTheDocument()
    expect(screen.queryByText('Алексей')).not.toBeInTheDocument()
  })

  it('shows role select for superadmin on users tab', async () => {
    const user = userEvent.setup()
    useAuthStore.setState({
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      user: {
        id: 'superadmin-1',
        email: 'owner@example.com',
        name: 'Владелец',
        avatarUrl: null,
        role: 'superadmin',
      },
    })
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Пользователи' }))

    expect(await screen.findByText('Алексей')).toBeInTheDocument()
    expect(screen.getAllByLabelText('Изменить роль пользователя')).toHaveLength(2)
    expect(screen.getByLabelText('Роль superadmin')).toBeDisabled()
  })

  it('superadmin can assign admin role to user', async () => {
    const user = userEvent.setup()
    useAuthStore.setState({
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      user: {
        id: 'superadmin-1',
        email: 'owner@example.com',
        name: 'Владелец',
        avatarUrl: null,
        role: 'superadmin',
      },
    })
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Пользователи' }))

    const selects = await screen.findAllByLabelText('Изменить роль пользователя')
    await user.selectOptions(selects[0], 'admin')

    expect(await screen.findAllByText('Admin')).not.toHaveLength(0)
  })

  it('admin can block and unblock a user', async () => {
    const user = userEvent.setup()
    setAdminSession()
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Пользователи' }))

    expect(await screen.findByText('Алексей')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Заблокировать пользователя Алексей' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Заблокировать пользователя Алексей' }),
    )

    expect(await screen.findByText('Заблокирован', { exact: true })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Разблокировать пользователя Алексей' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Разблокировать пользователя Алексей' }),
    )

    expect(
      await screen.findByRole('button', { name: 'Заблокировать пользователя Алексей' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Заблокирован', { exact: true })).not.toBeInTheDocument()
  })

  it('filters users by blocked status', async () => {
    const user = userEvent.setup()
    setAdminSession()
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Пользователи' }))
    await screen.findByText('Алексей')

    await user.click(
      screen.getByRole('button', { name: 'Заблокировать пользователя Алексей' }),
    )
    await screen.findByText('Заблокирован', { exact: true })

    const usersGroup = screen.getByRole('group', { name: 'Фильтр пользователей' })
    await user.click(within(usersGroup).getByRole('button', { name: 'Заблокированные' }))

    expect(await screen.findByText('Алексей')).toBeInTheDocument()
    expect(screen.queryByText('Админ')).not.toBeInTheDocument()
  })

  it('switches to locations tab and filters by search', async () => {
    const user = userEvent.setup()
    setAdminSession()
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Локации' }))

    expect(await screen.findByText('Level-Up Lounge')).toBeInTheDocument()
    expect(screen.getByText('Архивный зал')).toBeInTheDocument()
    expect(screen.getByText('Всего:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Создать локацию' })).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Поиск локаций' }), 'Архив')

    expect(await screen.findByText('Архивный зал')).toBeInTheDocument()
    expect(screen.queryByText('Level-Up Lounge')).not.toBeInTheDocument()
  })

  it('filters events by archived status', async () => {
    const user = userEvent.setup()
    setAdminSession()
    renderPage()

    await screen.findByText('Игровой вечер — октябрь')

    await user.click(screen.getByRole('button', { name: 'Архив' }))

    expect(await screen.findByText('Архивная встреча')).toBeInTheDocument()
    expect(screen.queryByText('Игровой вечер — октябрь')).not.toBeInTheDocument()
    expect(screen.getByText('Всего:')).toBeInTheDocument()
  })

  it('shows empty state when events search has no matches', async () => {
    const user = userEvent.setup()
    setAdminSession()
    renderPage()

    await screen.findByText('Игровой вечер — октябрь')

    await user.type(
      screen.getByRole('textbox', { name: 'Поиск событий' }),
      'несуществующая встреча',
    )

    expect(await screen.findByText('События не найдены.')).toBeInTheDocument()
    expect(screen.getByText('Всего:')).toBeInTheDocument()
  })
})
