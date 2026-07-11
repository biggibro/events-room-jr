import request from 'supertest'
import { app, authHeader, createOpenEvent, joinEvent, login } from './helpers'

describe('Event participants admin API', () => {
  it('removes participants in batch as admin', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('player@jackaroo.local')
    const openEvent = await createOpenEvent(admin.accessToken)
    await joinEvent(player.accessToken, openEvent.id)

    const response = await request(app)
      .delete(`/api/events/${openEvent.id}/participants`)
      .set(authHeader(admin.accessToken))
      .send({ userIds: [player.user.id] })
      .expect(200)

    expect(response.body.participantUserIds).not.toContain(player.user.id)
    expect(
      response.body.participants.every(
        (participant: { userId: string }) => participant.userId !== player.user.id,
      ),
    ).toBe(true)
  })

  it('returns 403 for regular user', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('player@jackaroo.local')
    const marina = await login('marina@jackaroo.local')
    const openEvent = await createOpenEvent(admin.accessToken)
    await joinEvent(marina.accessToken, openEvent.id)

    await request(app)
      .delete(`/api/events/${openEvent.id}/participants`)
      .set(authHeader(player.accessToken))
      .send({ userIds: [marina.user.id] })
      .expect(403)
  })

  it('returns 404 when participant is missing', async () => {
    const admin = await login('admin@jackaroo.local')
    const openEvent = await createOpenEvent(admin.accessToken)

    await request(app)
      .delete(`/api/events/${openEvent.id}/participants`)
      .set(authHeader(admin.accessToken))
      .send({ userIds: ['00000000-0000-4000-8000-000000000000'] })
      .expect(404)
  })
})
