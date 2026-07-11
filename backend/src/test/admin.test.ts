import request from 'supertest'
import { app, authHeader, login } from './helpers'

describe('Admin users list API', () => {
  it('allows admin to list users', async () => {
    const admin = await login('admin@jackaroo.local')

    const response = await request(app)
      .get('/api/admin/users')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBeGreaterThan(0)
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      email: expect.any(String),
      role: expect.any(String),
    })
  })

  it('allows superadmin to list users', async () => {
    const superadmin = await login('owner@example.com')

    await request(app)
      .get('/api/admin/users')
      .set(authHeader(superadmin.accessToken))
      .expect(200)
  })

  it('returns 403 for regular user', async () => {
    const player = await login('player@jackaroo.local')

    await request(app)
      .get('/api/admin/users')
      .set(authHeader(player.accessToken))
      .expect(403)
  })

  it('returns 401 without auth', async () => {
    await request(app).get('/api/admin/users').expect(401)
  })

  it('filters users by role', async () => {
    const admin = await login('admin@jackaroo.local')

    const response = await request(app)
      .get('/api/admin/users')
      .query({ role: 'user' })
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.length).toBeGreaterThan(0)
    expect(response.body.every((user: { role: string }) => user.role === 'user')).toBe(
      true,
    )
  })

  it('searches users by name or email', async () => {
    const admin = await login('admin@jackaroo.local')

    const response = await request(app)
      .get('/api/admin/users')
      .query({ search: 'marina' })
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body).toHaveLength(1)
    expect(response.body[0].email).toBe('marina@jackaroo.local')
  })
})
