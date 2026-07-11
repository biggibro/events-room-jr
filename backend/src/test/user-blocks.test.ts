import request from 'supertest'
import { app, authHeader, login } from './helpers'

describe('Admin user block API', () => {
  it('allows admin to block and unblock a user', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('marina@jackaroo.local')

    const blocked = await request(app)
      .post(`/api/admin/users/${player.user.id}/block`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(blocked.body.isBlocked).toBe(true)

    const list = await request(app)
      .get('/api/admin/users')
      .query({ blocked: 'blocked' })
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(list.body.some((user: { id: string }) => user.id === player.user.id)).toBe(true)

    const unblocked = await request(app)
      .delete(`/api/admin/users/${player.user.id}/block`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(unblocked.body.isBlocked).toBe(false)
  })

  it('allows superadmin to block a user', async () => {
    const superadmin = await login('owner@example.com')
    const player = await login('player@jackaroo.local')

    const response = await request(app)
      .post(`/api/admin/users/${player.user.id}/block`)
      .set(authHeader(superadmin.accessToken))
      .expect(200)

    expect(response.body.isBlocked).toBe(true)

    await request(app)
      .delete(`/api/admin/users/${player.user.id}/block`)
      .set(authHeader(superadmin.accessToken))
      .expect(200)
  })

  it('returns 403 for regular user', async () => {
    const player = await login('player@jackaroo.local')
    const marina = await login('marina@jackaroo.local')

    await request(app)
      .post(`/api/admin/users/${marina.user.id}/block`)
      .set(authHeader(player.accessToken))
      .expect(403)
  })

  it('does not allow blocking yourself', async () => {
    const admin = await login('admin@jackaroo.local')

    await request(app)
      .post(`/api/admin/users/${admin.user.id}/block`)
      .set(authHeader(admin.accessToken))
      .expect(400)
  })

  it('does not allow blocking superadmin', async () => {
    const admin = await login('admin@jackaroo.local')
    const superadmin = await login('owner@example.com')

    await request(app)
      .post(`/api/admin/users/${superadmin.user.id}/block`)
      .set(authHeader(admin.accessToken))
      .expect(403)
  })

  it('returns 409 when blocking an already blocked user', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('marina@jackaroo.local')

    await request(app)
      .post(`/api/admin/users/${player.user.id}/block`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    await request(app)
      .post(`/api/admin/users/${player.user.id}/block`)
      .set(authHeader(admin.accessToken))
      .expect(409)

    await request(app)
      .delete(`/api/admin/users/${player.user.id}/block`)
      .set(authHeader(admin.accessToken))
      .expect(200)
  })
})
