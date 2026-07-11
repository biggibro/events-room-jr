import request from 'supertest'
import { createApp } from '../app'

export const app = createApp()

type AuthResult = {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; role: string }
}

type LocationDto = {
  id: string
  name: string
  address: string
  description: string
}

type EventDto = {
  id: string
  status: string
  title: string
  currentParticipants?: number
  participantUserIds?: string[]
  participants?: Array<{
    userId: string
    guests: Array<{ id: string; name: string }>
  }>
}

export async function login(email: string, password = 'password123') {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200)

  return response.body as AuthResult
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export async function createLocation(
  adminToken: string,
  data?: Partial<{ name: string; address: string; description: string }>,
) {
  const response = await request(app)
    .post('/api/locations')
    .set(authHeader(adminToken))
    .send({
      name: data?.name ?? 'Test Hall',
      address: data?.address ?? 'ул. Тестовая, 1',
      description: data?.description ?? 'Описание площадки',
    })
    .expect(201)

  return response.body as LocationDto
}

export async function createEvent(
  adminToken: string,
  locationId: string,
  data?: Partial<{
    title: string
    eventDate: string
    eventTime: string
    maxParticipants: number
  }>,
) {
  const response = await request(app)
    .post('/api/events')
    .set(authHeader(adminToken))
    .send({
      title: data?.title ?? 'Тестовое событие',
      description: 'Описание события',
      eventDate: data?.eventDate ?? '2026-12-15',
      eventTime: data?.eventTime ?? '19:00',
      locationId,
      maxParticipants: data?.maxParticipants ?? 16,
    })
    .expect(201)

  return response.body as EventDto
}

export async function setEventStatus(
  adminToken: string,
  eventId: string,
  status: 'registration_open' | 'registration_closed' | 'completed',
) {
  const response = await request(app)
    .patch(`/api/events/${eventId}/status`)
    .set(authHeader(adminToken))
    .send({ status })
    .expect(200)

  return response.body as EventDto
}

export async function createOpenEvent(
  adminToken: string,
  locationId?: string,
  data?: Parameters<typeof createEvent>[2],
) {
  const resolvedLocationId = locationId ?? (await createLocation(adminToken)).id
  const event = await createEvent(adminToken, resolvedLocationId, data)
  return setEventStatus(adminToken, event.id, 'registration_open')
}

export async function joinEvent(
  userToken: string,
  eventId: string,
  guestNames: string[] = [],
) {
  const response = await request(app)
    .post(`/api/events/${eventId}/join`)
    .set(authHeader(userToken))
    .send({ guestNames })
    .expect(200)

  return response.body as EventDto
}

export async function setupProfileTestEvents() {
  const admin = await login('admin@jackaroo.local')
  const player = await login('player@jackaroo.local')
  const marina = await login('marina@jackaroo.local')
  const location = await createLocation(admin.accessToken)

  const completedEvent = await createEvent(admin.accessToken, location.id, {
    title: 'Осенний турнир',
    eventDate: '2026-10-10',
  })
  await setEventStatus(admin.accessToken, completedEvent.id, 'registration_open')
  await joinEvent(player.accessToken, completedEvent.id)
  await setEventStatus(admin.accessToken, completedEvent.id, 'completed')
  await request(app)
    .patch(`/api/events/${completedEvent.id}/winners`)
    .set(authHeader(admin.accessToken))
    .send({ winners: [{ userId: player.user.id, count: 2 }] })
    .expect(200)

  const playerUpcoming = await createOpenEvent(admin.accessToken, location.id, {
    title: 'Игровой вечер — октябрь',
    eventDate: '2026-10-24',
  })
  await joinEvent(player.accessToken, playerUpcoming.id)

  const marinaUpcoming = await createOpenEvent(admin.accessToken, location.id, {
    title: 'Игровой вечер — октябрь',
    eventDate: '2026-11-02',
  })
  await joinEvent(marina.accessToken, marinaUpcoming.id)
}
