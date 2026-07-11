import request from 'supertest'
import { app, authHeader, createOpenEvent, joinEvent, login } from './helpers'

describe('Winners API', () => {
  it('assigns winners in registration_open status', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('player@jackaroo.local')
    const openEvent = await createOpenEvent(admin.accessToken)

    await joinEvent(player.accessToken, openEvent.id)

    const response = await request(app)
      .patch(`/api/events/${openEvent.id}/winners`)
      .set(authHeader(admin.accessToken))
      .send({ winners: [{ userId: player.user.id, count: 1 }] })
      .expect(200)

    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toMatchObject({
      type: 'user',
      count: 1,
      userId: player.user.id,
    })

    const event = await request(app).get(`/api/events/${openEvent.id}`).expect(200)
    expect(event.body.winners).toHaveLength(1)
    expect(event.body.winners[0]).toMatchObject({
      type: 'user',
      userId: player.user.id,
      count: 1,
    })
  })

  it('assigns wins to guests', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('player@jackaroo.local')
    const openEvent = await createOpenEvent(admin.accessToken)

    const joined = await joinEvent(player.accessToken, openEvent.id, ['Аня'])

    const guestId = joined.participants!.find(
      (participant) => participant.userId === player.user.id,
    )!.guests[0].id

    const response = await request(app)
      .patch(`/api/events/${openEvent.id}/winners`)
      .set(authHeader(admin.accessToken))
      .send({ winners: [{ guestId, count: 2 }] })
      .expect(200)

    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toMatchObject({
      type: 'guest',
      guestId,
      name: 'Аня',
      hostName: expect.any(String),
      count: 2,
    })
  })

  it('returns 400 for non-participant user winner', async () => {
    const admin = await login('admin@jackaroo.local')
    const outsider = await login('marina@jackaroo.local')
    const openEvent = await createOpenEvent(admin.accessToken)

    await request(app)
      .patch(`/api/events/${openEvent.id}/winners`)
      .set(authHeader(admin.accessToken))
      .send({ winners: [{ userId: outsider.user.id, count: 1 }] })
      .expect(400)
  })

  it('returns 403 for regular user', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('player@jackaroo.local')
    const openEvent = await createOpenEvent(admin.accessToken)
    await joinEvent(player.accessToken, openEvent.id)

    await request(app)
      .patch(`/api/events/${openEvent.id}/winners`)
      .set(authHeader(player.accessToken))
      .send({ winners: [{ userId: player.user.id, count: 1 }] })
      .expect(403)
  })
})
