import request from 'supertest'
import { app, authHeader, login } from './helpers'

describe('Blocked user auth', () => {
  it('prevents blocked user from logging in', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('marina@jackaroo.local')

    await request(app)
      .post(`/api/admin/users/${player.user.id}/block`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'marina@jackaroo.local', password: 'password123' })
      .expect(403)

    await request(app)
      .delete(`/api/admin/users/${player.user.id}/block`)
      .set(authHeader(admin.accessToken))
      .expect(200)
  })

  it('prevents blocked user from refreshing token', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('player@jackaroo.local')
    const refreshToken = player.refreshToken

    await request(app)
      .post(`/api/admin/users/${player.user.id}/block`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(403)

    await request(app)
      .delete(`/api/admin/users/${player.user.id}/block`)
      .set(authHeader(admin.accessToken))
      .expect(200)
  })

  it('rejects blocked user access token on protected route', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('player@jackaroo.local')

    await request(app)
      .post(`/api/admin/users/${player.user.id}/block`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    await request(app)
      .get('/api/me')
      .set(authHeader(player.accessToken))
      .expect(403)

    await request(app)
      .delete(`/api/admin/users/${player.user.id}/block`)
      .set(authHeader(admin.accessToken))
      .expect(200)
  })
})
