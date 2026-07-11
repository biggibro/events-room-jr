import request from 'supertest'
import { prisma } from '../lib/prisma'
import { app, authHeader, createOpenEvent, joinEvent, login } from './helpers'

describe('Chat API', () => {
  it('returns 401 without auth token', async () => {
    const admin = await login('admin@jackaroo.local')
    const openEvent = await createOpenEvent(admin.accessToken)

    await request(app).get(`/api/events/${openEvent.id}/messages`).expect(401)
  })

  it('returns 403 for non-participant', async () => {
    const admin = await login('admin@jackaroo.local')
    const openEvent = await createOpenEvent(admin.accessToken)
    const outsider = await login('owner@example.com')

    await request(app)
      .get(`/api/events/${openEvent.id}/messages`)
      .set(authHeader(outsider.accessToken))
      .expect(403)
  })

  it('returns message history for participant', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('player@jackaroo.local')
    const openEvent = await createOpenEvent(admin.accessToken)
    await joinEvent(player.accessToken, openEvent.id)

    await prisma.eventMessage.create({
      data: {
        eventId: openEvent.id,
        userId: player.user.id,
        message: 'Тестовое сообщение',
      },
    })

    const response = await request(app)
      .get(`/api/events/${openEvent.id}/messages`)
      .set(authHeader(player.accessToken))
      .expect(200)

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventId: openEvent.id,
          userId: player.user.id,
          username: 'Алексей',
          text: 'Тестовое сообщение',
        }),
      ]),
    )
  })

  it('returns 404 for unknown event', async () => {
    const player = await login('player@jackaroo.local')

    await request(app)
      .get('/api/events/00000000-0000-4000-8000-000000999999/messages')
      .set(authHeader(player.accessToken))
      .expect(404)
  })
})
