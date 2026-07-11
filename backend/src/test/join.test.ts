import request from 'supertest'
import {
  app,
  authHeader,
  createEvent,
  createLocation,
  createOpenEvent,
  joinEvent,
  login,
  setEventStatus,
} from './helpers'

describe('Join API', () => {
  it('joins event and replaces guests on second request', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('player@jackaroo.local')
    const openEvent = await createOpenEvent(admin.accessToken)

    await joinEvent(player.accessToken, openEvent.id, ['Аня', 'Петя'])

    const updated = await joinEvent(player.accessToken, openEvent.id, ['Маша'])

    expect(updated.currentParticipants).toBe(2)
  })

  it('returns 403 when registration is closed', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('marina@jackaroo.local')
    const location = await createLocation(admin.accessToken)
    const event = await createEvent(admin.accessToken, location.id)
    const closedEvent = await setEventStatus(admin.accessToken, event.id, 'registration_closed')

    await request(app)
      .post(`/api/events/${closedEvent.id}/join`)
      .set(authHeader(player.accessToken))
      .send({ guestNames: [] })
      .expect(403)
  })

  it('leaves event and frees participant slot', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('player@jackaroo.local')
    const openEvent = await createOpenEvent(admin.accessToken)
    await joinEvent(player.accessToken, openEvent.id)

    const left = await request(app)
      .delete(`/api/events/${openEvent.id}/join`)
      .set(authHeader(player.accessToken))
      .expect(200)

    expect(left.body.participantUserIds).not.toContain(player.user.id)
  })

  it('returns 404 when leaving without participation', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('player@jackaroo.local')
    const openEvent = await createOpenEvent(admin.accessToken)

    await request(app)
      .delete(`/api/events/${openEvent.id}/join`)
      .set(authHeader(player.accessToken))
      .expect(404)
  })
})
