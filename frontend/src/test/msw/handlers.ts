import { http, HttpResponse } from 'msw'

const mockUser = {
  id: 'user-1',
  email: 'player@jackaroo.local',
  name: 'Алексей',
  avatarUrl: null,
  bio: 'Играю в Jackaroo на встречах города и слежу за статистикой побед.',
  tagline: 'Игрок Jackaroo',
  role: 'user' as const,
}

const mockProfileStats = {
  officialWins: 2,
  gamesPlayed: 1,
  winrate: '100%',
  pastEvents: [
    {
      id: 'evt-completed',
      title: 'Осенний турнир',
      date: '2026-10-10',
      wins: 2,
      badge: 'win' as const,
      imageUrl: 'https://example.com/tournament.jpg',
    },
  ],
  upcomingEvents: [
    {
      id: 'evt-1',
      title: 'Игровой вечер — октябрь',
      date: '2026-10-24',
      time: '19:00',
      location: 'Level-Up Lounge',
      locationAddress: 'ул. Примерная, 12',
      imageUrl: 'https://example.com/image.jpg',
      status: 'registration_open' as const,
    },
  ],
}

const mockEvent = {
  id: 'evt-1',
  title: 'Игровой вечер — октябрь',
  description: 'Еженедельная встреча Jackaroo.',
  eventDate: '2026-10-24',
  eventTime: '19:00',
  location: 'Level-Up Lounge',
  locationAddress: 'ул. Примерная, 12',
  locationMapUrl: 'https://yandex.ru/maps/-/CCUqY0V~',
  locationId: 'loc-1',
  maxParticipants: 16,
  currentParticipants: 2,
  imageUrl: 'https://example.com/image.jpg',
  status: 'registration_open' as const,
  seatingType: 'random' as const,
  durationHours: 4,
  participantUserIds: ['user-1'],
}

const mockEventDetail = {
  ...mockEvent,
  winners: [] as Array<
    | { type: 'user'; userId: string; name: string; count: number }
    | { type: 'guest'; guestId: string; name: string; hostName: string; count: number }
  >,
  participants: [
    {
      userId: 'user-1',
      name: 'Алексей',
      avatarUrl: '',
      note: 'Участник',
      guestNames: [],
      guests: [] as Array<{ id: string; name: string }>,
    },
  ],
}

const defaultMockLocations = () => [
  {
    id: 'loc-1',
    name: 'Level-Up Lounge',
    address: 'ул. Примерная, 12',
    description: 'Уютный зал для домашних турниров.',
    phone: '+7 (900) 123-45-67',
    mapUrl: 'https://yandex.ru/maps/-/CCUqY0V~',
    isArchived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'loc-2',
    name: 'Архивный зал',
    address: 'ул. Старая, 1',
    description: 'Старая площадка в архиве.',
    phone: null,
    mapUrl: null,
    isArchived: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

const mockLocations = defaultMockLocations()

const mockAdminUsers = [
  {
    id: 'user-1',
    name: 'Алексей',
    email: 'player@jackaroo.local',
    avatarUrl: null,
    role: 'user' as const,
    isBlocked: false,
  },
  {
    id: 'admin-1',
    name: 'Админ',
    email: 'admin@jackaroo.local',
    avatarUrl: null,
    role: 'admin' as const,
    isBlocked: false,
  },
  {
    id: 'superadmin-1',
    name: 'Владелец',
    email: 'owner@example.com',
    avatarUrl: null,
    role: 'superadmin' as const,
    isBlocked: false,
  },
]

const mockEvents = [
  mockEvent,
  {
    ...mockEvent,
    id: 'evt-archived',
    title: 'Архивная встреча',
    status: 'archived' as const,
  },
]

export const handlers = [
  http.post('*/api/auth/login', async () => {
    return HttpResponse.json({
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      user: mockUser,
    })
  }),
  http.post('*/api/auth/register', async () => {
    return HttpResponse.json({
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      user: { ...mockUser, email: 'new@jackaroo.local', name: 'Новый игрок' },
    })
  }),
  http.post('*/api/auth/refresh', async () => {
    return HttpResponse.json({
      accessToken: 'refreshed-token',
      refreshToken: 'refreshed-refresh',
      user: mockUser,
    })
  }),
  http.get('*/api/me', () => HttpResponse.json(mockUser)),
  http.get('*/api/me/stats', () => HttpResponse.json(mockProfileStats)),
  http.get('*/api/users/:id/profile', ({ params }) => {
    const user = mockAdminUsers.find((item) => item.id === params.id)
    if (!user) {
      return HttpResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    return HttpResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: mockUser.bio,
      tagline: mockUser.tagline,
      role: user.role,
      ...mockProfileStats,
    })
  }),
  http.patch('*/api/me', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({
      ...mockUser,
      name: (body.name as string | undefined) ?? mockUser.name,
      tagline: (body.tagline as string | undefined) ?? mockUser.tagline,
      bio: (body.bio as string | undefined) ?? mockUser.bio,
    })
  }),
  http.patch('*/api/me/credentials', async ({ request }) => {
    const body = (await request.json()) as {
      email?: string
      currentPassword?: string
      newPassword?: string
    }
    if (body.currentPassword !== 'password123') {
      return HttpResponse.json({ error: 'Неверный текущий пароль' }, { status: 401 })
    }
    if (body.email === 'player@jackaroo.local') {
      return HttpResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 },
      )
    }
    return HttpResponse.json({
      ...mockUser,
      email: body.email ?? mockUser.email,
    })
  }),
  http.get('*/api/events', ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''
    const status = url.searchParams.get('status') ?? 'ALL'
    const page = url.searchParams.get('page')
    const limit = url.searchParams.get('limit')

    let events = [...mockEvents]

    if (status !== 'ALL') {
      events = events.filter((event) => event.status === status)
    } else {
      events = events.filter((event) => event.status !== 'archived')
    }

    if (search) {
      events = events.filter((event) => event.title.toLowerCase().includes(search))
    }

    if (page && limit) {
      const pageNum = Number(page)
      const limitNum = Number(limit)
      const start = (pageNum - 1) * limitNum
      const items = events.slice(start, start + limitNum)

      return HttpResponse.json({
        items,
        total: events.length,
        page: pageNum,
        limit: limitNum,
        hasMore: start + items.length < events.length,
      })
    }

    return HttpResponse.json(events)
  }),
  http.get('*/api/events/:id', () => HttpResponse.json(mockEventDetail)),
  http.get('*/api/events/:id/messages', () => HttpResponse.json([])),
  http.post('*/api/events', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(
      {
        ...mockEventDetail,
        id: 'evt-new',
        title: body.title,
        description: body.description,
        eventDate: body.eventDate,
        eventTime: body.eventTime,
        locationId: body.locationId,
        maxParticipants: body.maxParticipants,
        seatingType: body.seatingType ?? 'free',
        durationHours: body.durationHours ?? 3,
        imageUrl: body.imageUrl ?? '',
        status: 'archived',
        currentParticipants: 0,
        participantUserIds: [],
        participants: [],
      },
      { status: 201 },
    )
  }),
  http.post('*/api/events/:id/join', () =>
    HttpResponse.json({
      ...mockEventDetail,
      currentParticipants: 3,
      participantUserIds: ['user-1'],
    }),
  ),
  http.delete('*/api/events/:id/join', () =>
    HttpResponse.json({
      ...mockEventDetail,
      currentParticipants: 1,
      participantUserIds: [],
      participants: [],
    }),
  ),
  http.get('*/api/locations', ({ request }) => {
    const url = new URL(request.url)
    const includeArchived = url.searchParams.get('includeArchived') === 'true'
    const locations = includeArchived
      ? mockLocations
      : mockLocations.filter((location) => !location.isArchived)
    return HttpResponse.json(locations)
  }),
  http.get('*/api/locations/:id', ({ params }) => {
    const location = mockLocations.find((item) => item.id === params.id)
    if (!location) {
      return HttpResponse.json({ error: 'Локация не найдена' }, { status: 404 })
    }
    return HttpResponse.json(location)
  }),
  http.post('*/api/locations', async ({ request }) => {
    const body = (await request.json()) as {
      name: string
      address: string
      description: string
      phone?: string
      mapUrl?: string
    }
    const created = {
      id: `loc-${Date.now()}`,
      name: body.name,
      address: body.address,
      description: body.description,
      phone: body.phone ?? null,
      mapUrl: body.mapUrl ?? null,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockLocations.unshift(created)
    return HttpResponse.json(created, { status: 201 })
  }),
  http.patch('*/api/locations/:id/archive', ({ params }) => {
    const index = mockLocations.findIndex((item) => item.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Локация не найдена' }, { status: 404 })
    }
    mockLocations[index] = { ...mockLocations[index], isArchived: true }
    return HttpResponse.json(mockLocations[index])
  }),
  http.patch('*/api/locations/:id', async ({ params, request }) => {
    const index = mockLocations.findIndex((item) => item.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Локация не найдена' }, { status: 404 })
    }
    const body = (await request.json()) as Partial<{
      name: string
      address: string
      description: string
      phone: string
      mapUrl: string
    }>
    mockLocations[index] = {
      ...mockLocations[index],
      ...body,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(mockLocations[index])
  }),
  http.get('*/api/admin/users', ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''
    const role = url.searchParams.get('role') ?? 'ALL'
    const blocked = url.searchParams.get('blocked') ?? 'ALL'

    let users = [...mockAdminUsers]

    if (role !== 'ALL') {
      users = users.filter((user) => user.role === role)
    }

    if (blocked === 'blocked') {
      users = users.filter((user) => user.isBlocked)
    }

    if (search) {
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search),
      )
    }

    return HttpResponse.json(users)
  }),
  http.post('*/api/admin/users/:id/block', ({ params }) => {
    const index = mockAdminUsers.findIndex((item) => item.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const user = mockAdminUsers[index]
    if (user.role === 'superadmin') {
      return HttpResponse.json({ error: 'Нельзя заблокировать superadmin' }, { status: 403 })
    }

    mockAdminUsers[index] = { ...user, isBlocked: true }
    return HttpResponse.json(mockAdminUsers[index])
  }),
  http.delete('*/api/admin/users/:id/block', ({ params }) => {
    const index = mockAdminUsers.findIndex((item) => item.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const user = mockAdminUsers[index]
    if (!user.isBlocked) {
      return HttpResponse.json({ error: 'Пользователь не заблокирован' }, { status: 404 })
    }

    mockAdminUsers[index] = { ...user, isBlocked: false }
    return HttpResponse.json(mockAdminUsers[index])
  }),
  http.patch('*/api/admin/users/:id/role', async ({ params, request }) => {
    const body = (await request.json()) as { role: 'user' | 'admin' }
    const user = mockAdminUsers.find((item) => item.id === params.id)

    if (!user) {
      return HttpResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    if (user.role === 'superadmin') {
      return HttpResponse.json({ error: 'Нельзя изменить роль superadmin' }, { status: 403 })
    }

    const updated = { ...user, role: body.role }
    const index = mockAdminUsers.findIndex((item) => item.id === params.id)
    mockAdminUsers[index] = updated

    return HttpResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    })
  }),
  http.patch('*/api/events/:id', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({
      ...mockEventDetail,
      ...body,
    })
  }),
  http.patch('*/api/events/:id/status', async ({ request }) => {
    const body = (await request.json()) as { status: typeof mockEvent.status }
    return HttpResponse.json({
      ...mockEventDetail,
      status: body.status,
    })
  }),
  http.patch('*/api/events/:id/archive', () =>
    HttpResponse.json({
      ...mockEventDetail,
      status: 'archived',
    }),
  ),
  http.patch('*/api/events/:id/winners', async ({ request }) => {
    const body = (await request.json()) as {
      winners: Array<
        | { userId: string; count: number }
        | { guestId: string; count: number }
      >
    }

    mockEventDetail.winners = body.winners.flatMap((winner) => {
      if ('userId' in winner) {
        const participant = mockEventDetail.participants.find(
          (person) => person.userId === winner.userId,
        )
        if (!participant) return []

        return [
          {
            type: 'user' as const,
            userId: winner.userId,
            name: participant.name,
            count: winner.count,
          },
        ]
      }

      for (const participant of mockEventDetail.participants) {
        const guest = participant.guests.find((item) => item.id === winner.guestId)
        if (guest) {
          return [
            {
              type: 'guest' as const,
              guestId: winner.guestId,
              name: guest.name,
              hostName: participant.name,
              count: winner.count,
            },
          ]
        }
      }

      return []
    })

    return HttpResponse.json(mockEventDetail.winners)
  }),
  http.delete('*/api/events/:id/participants', async ({ request }) => {
    const body = (await request.json()) as { userIds: string[] }
    return HttpResponse.json({
      ...mockEventDetail,
      currentParticipants: Math.max(
        0,
        mockEventDetail.currentParticipants - body.userIds.length,
      ),
      participantUserIds: mockEventDetail.participantUserIds.filter(
        (userId) => !body.userIds.includes(userId),
      ),
      participants: mockEventDetail.participants.filter(
        (participant) => !body.userIds.includes(participant.userId),
      ),
    })
  }),
]

export function resetMockAdminUsers() {
  for (const user of mockAdminUsers) {
    user.isBlocked = false
    if (user.id === 'user-1') {
      user.role = 'user'
    }
  }
}

export function resetMockLocations() {
  const fresh = defaultMockLocations()
  mockLocations.length = 0
  mockLocations.push(...fresh)
}
