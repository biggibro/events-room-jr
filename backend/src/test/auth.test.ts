import request from 'supertest'
import { app, authHeader, login } from './helpers'

describe('Auth API', () => {
  it('registers a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@jackaroo.local',
        password: 'password123',
        name: 'Новый игрок',
      })
      .expect(201)

    expect(response.body.accessToken).toBeDefined()
    expect(response.body.user.email).toBe('newuser@jackaroo.local')
    expect(response.body.user.role).toBe('user')
  })

  it('logs in seeded player', async () => {
    const result = await login('player@jackaroo.local')
    expect(result.user.role).toBe('user')
  })

  it('bootstraps superadmin from env email on login', async () => {
    const result = await login('owner@example.com')
    expect(result.user.role).toBe('superadmin')
  })

  it('returns current user from /api/me', async () => {
    const { accessToken } = await login('player@jackaroo.local')
    const response = await request(app)
      .get('/api/me')
      .set(authHeader(accessToken))
      .expect(200)

    expect(response.body.email).toBe('player@jackaroo.local')
  })

  it('refreshes access token', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'player@jackaroo.local', password: 'password123' })
      .expect(200)

    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: loginResponse.body.refreshToken })
      .expect(200)

    expect(response.body.accessToken).toBeDefined()
  })

  it('returns 401 without token on /api/me', async () => {
    await request(app).get('/api/me').expect(401)
  })
})
