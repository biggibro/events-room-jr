import request from 'supertest'
import { app, authHeader, createLocation, login, setupProfileTestEvents } from './helpers'

describe('Profile API', () => {
  beforeEach(async () => {
    await setupProfileTestEvents()
  })
  it('returns profile fields from /api/me', async () => {
    const { accessToken } = await login('player@jackaroo.local')
    const response = await request(app)
      .get('/api/me')
      .set(authHeader(accessToken))
      .expect(200)

    expect(response.body.email).toBe('player@jackaroo.local')
    expect(response.body.name).toBe('Алексей')
    expect(response.body.tagline).toBe('Игрок Jackaroo')
    expect(response.body.bio).toContain('Jackaroo')
  })

  it('returns stats and past events from /api/me/stats', async () => {
    const { accessToken } = await login('player@jackaroo.local')
    const response = await request(app)
      .get('/api/me/stats')
      .set(authHeader(accessToken))
      .expect(200)

    expect(response.body.officialWins).toBe(2)
    expect(response.body.gamesPlayed).toBe(1)
    expect(response.body.winrate).toBe('100%')
    expect(response.body.pastEvents).toHaveLength(1)
    expect(response.body.pastEvents[0].title).toBe('Осенний турнир')
    expect(response.body.pastEvents[0].badge).toBe('win')
    expect(response.body.pastEvents[0].wins).toBe(2)
    expect(response.body.upcomingEvents).toHaveLength(1)
    expect(response.body.upcomingEvents[0].title).toBe('Игровой вечер — октябрь')
    expect(response.body.upcomingEvents[0].status).toBe('registration_open')
  })

  it('returns empty stats for user without completed games', async () => {
    const { accessToken } = await login('marina@jackaroo.local')
    const response = await request(app)
      .get('/api/me/stats')
      .set(authHeader(accessToken))
      .expect(200)

    expect(response.body.officialWins).toBe(0)
    expect(response.body.gamesPlayed).toBe(0)
    expect(response.body.winrate).toBe('0%')
    expect(response.body.pastEvents).toEqual([])
    expect(response.body.upcomingEvents).toHaveLength(1)
    expect(response.body.upcomingEvents[0].title).toBe('Игровой вечер — октябрь')
  })

  it('returns 401 without token on /api/me/stats', async () => {
    await request(app).get('/api/me/stats').expect(401)
  })

  it('returns another user profile from /api/users/:id/profile', async () => {
    const { accessToken } = await login('admin@jackaroo.local')
    const player = await login('player@jackaroo.local')
    const response = await request(app)
      .get(`/api/users/${player.user.id}/profile`)
      .set(authHeader(accessToken))
      .expect(200)

    expect(response.body.name).toBe('Алексей')
    expect(response.body.email).toBe('player@jackaroo.local')
    expect(response.body.officialWins).toBe(2)
    expect(response.body.pastEvents).toHaveLength(1)
    expect(response.body.upcomingEvents).toHaveLength(1)
  })

  it('hides email for non-admin viewers on /api/users/:id/profile', async () => {
    const { accessToken, user: player } = await login('player@jackaroo.local')
    const marina = await login('marina@jackaroo.local')
    const response = await request(app)
      .get(`/api/users/${marina.user.id}/profile`)
      .set(authHeader(accessToken))
      .expect(200)

    expect(response.body.name).toBe('Марина')
    expect(response.body.email).toBeUndefined()
    expect(response.body.upcomingEvents).toHaveLength(1)
  })

  it('returns 404 for unknown user on /api/users/:id/profile', async () => {
    const { accessToken } = await login('player@jackaroo.local')
    await request(app)
      .get('/api/users/non-existent-id/profile')
      .set(authHeader(accessToken))
      .expect(404)
  })

  it('updates profile fields via PATCH /api/me', async () => {
    const { accessToken } = await login('player@jackaroo.local')
    const response = await request(app)
      .patch('/api/me')
      .set(authHeader(accessToken))
      .send({
        name: 'Алексей Обновлённый',
        tagline: 'Чемпион Jackaroo',
        bio: 'Новое описание профиля',
      })
      .expect(200)

    expect(response.body.name).toBe('Алексей Обновлённый')
    expect(response.body.tagline).toBe('Чемпион Jackaroo')
    expect(response.body.bio).toBe('Новое описание профиля')
  })

  it('updates credentials via PATCH /api/me/credentials', async () => {
    const { accessToken } = await login('marina@jackaroo.local')
    const response = await request(app)
      .patch('/api/me/credentials')
      .set(authHeader(accessToken))
      .send({
        currentPassword: 'password123',
        newPassword: 'newpassword456',
      })
      .expect(200)

    expect(response.body.email).toBe('marina@jackaroo.local')

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'marina@jackaroo.local', password: 'newpassword456' })
      .expect(200)

    await request(app)
      .patch('/api/me/credentials')
      .set(authHeader(accessToken))
      .send({
        currentPassword: 'newpassword456',
        newPassword: 'password123',
      })
      .expect(200)
  })

  it('returns 401 for wrong current password on PATCH /api/me/credentials', async () => {
    const { accessToken } = await login('player@jackaroo.local')
    await request(app)
      .patch('/api/me/credentials')
      .set(authHeader(accessToken))
      .send({
        currentPassword: 'wrong-password',
        newPassword: 'newpassword456',
      })
      .expect(401)
  })

  it('returns 409 for duplicate email on PATCH /api/me/credentials', async () => {
    const { accessToken } = await login('marina@jackaroo.local')
    await request(app)
      .patch('/api/me/credentials')
      .set(authHeader(accessToken))
      .send({
        email: 'player@jackaroo.local',
        currentPassword: 'password123',
      })
      .expect(409)
  })
})
