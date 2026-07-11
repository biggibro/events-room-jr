import request from 'supertest'
import { app, authHeader, createOpenEvent, joinEvent, login } from './helpers'

describe('Events API', () => {
  it('lists public events without auth', async () => {
    const admin = await login('admin@jackaroo.local')
    await createOpenEvent(admin.accessToken)

    const response = await request(app).get('/api/events').expect(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.every((event: { status: string }) => event.status !== 'archived')).toBe(
      true,
    )
  })

  it('paginates events when page and limit are provided', async () => {
    const admin = await login('admin@jackaroo.local')
    await createOpenEvent(admin.accessToken)

    const response = await request(app)
      .get('/api/events')
      .query({ page: 1, limit: 1 })
      .expect(200)

    expect(response.body).toMatchObject({
      items: expect.any(Array),
      total: expect.any(Number),
      page: 1,
      limit: 1,
      hasMore: expect.any(Boolean),
    })
    expect(response.body.items).toHaveLength(1)
    expect(response.body.total).toBeGreaterThanOrEqual(1)
  })

  it('gets event by id with participants', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('player@jackaroo.local')
    const openEvent = await createOpenEvent(admin.accessToken)
    await joinEvent(player.accessToken, openEvent.id)

    const response = await request(app).get(`/api/events/${openEvent.id}`).expect(200)
    expect(response.body.title).toBeDefined()
    expect(Array.isArray(response.body.participants)).toBe(true)
    expect(response.body.participants.length).toBeGreaterThan(0)
    expect(response.body.participants[0]).toMatchObject({
      userId: expect.any(String),
      name: expect.any(String),
      note: expect.any(String),
      guestNames: expect.any(Array),
      guests: expect.any(Array),
    })
    expect(Array.isArray(response.body.winners)).toBe(true)
  })

  it('creates event as admin with archived default', async () => {
    const admin = await login('admin@jackaroo.local')
    const location = await request(app)
      .post('/api/locations')
      .set(authHeader(admin.accessToken))
      .send({
        name: 'New Hall',
        address: 'ул. Новая, 1',
        description: 'Новый зал',
      })
      .expect(201)

    const response = await request(app)
      .post('/api/events')
      .set(authHeader(admin.accessToken))
      .send({
        title: 'Новое событие',
        description: 'Описание',
        eventDate: '2026-12-15',
        eventTime: '19:00',
        locationId: location.body.id,
        maxParticipants: 10,
      })
      .expect(201)

    expect(response.body.status).toBe('archived')
  })

  it('updates status and archives event', async () => {
    const admin = await login('admin@jackaroo.local')
    const location = await request(app)
      .post('/api/locations')
      .set(authHeader(admin.accessToken))
      .send({
        name: 'Status Hall',
        address: 'ул. Статусная, 1',
        description: 'Зал для статусов',
      })
      .expect(201)

    const created = await request(app)
      .post('/api/events')
      .set(authHeader(admin.accessToken))
      .send({
        title: 'Статусное событие',
        description: 'Описание',
        eventDate: '2026-12-20',
        eventTime: '18:00',
        locationId: location.body.id,
        maxParticipants: 8,
      })
      .expect(201)

    const opened = await request(app)
      .patch(`/api/events/${created.body.id}/status`)
      .set(authHeader(admin.accessToken))
      .send({ status: 'registration_open' })
      .expect(200)

    expect(opened.body.status).toBe('registration_open')

    const archived = await request(app)
      .patch(`/api/events/${created.body.id}/archive`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(archived.body.status).toBe('archived')
  })

  it('updates event fields as admin', async () => {
    const admin = await login('admin@jackaroo.local')
    const location = await request(app)
      .post('/api/locations')
      .set(authHeader(admin.accessToken))
      .send({
        name: 'Edit Hall',
        address: 'ул. Редактируемая, 1',
        description: 'Зал для редактирования',
      })
      .expect(201)

    const created = await request(app)
      .post('/api/events')
      .set(authHeader(admin.accessToken))
      .send({
        title: 'До редактирования',
        description: 'Описание',
        eventDate: '2026-12-20',
        eventTime: '18:00',
        locationId: location.body.id,
        maxParticipants: 8,
      })
      .expect(201)

    const updated = await request(app)
      .patch(`/api/events/${created.body.id}`)
      .set(authHeader(admin.accessToken))
      .send({
        title: 'После редактирования',
        eventDate: '2026-12-21',
      })
      .expect(200)

    expect(updated.body.title).toBe('После редактирования')
    expect(updated.body.eventDate).toBe('2026-12-21')
    expect(Array.isArray(updated.body.participants)).toBe(true)
  })
})
