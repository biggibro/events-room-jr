import request from 'supertest'
import { app, authHeader, login } from './helpers'

describe('Roles API', () => {
  it('allows superadmin to promote user to admin', async () => {
    const superadmin = await login('owner@example.com')
    const player = await login('marina@jackaroo.local')

    const response = await request(app)
      .patch(`/api/admin/users/${player.user.id}/role`)
      .set(authHeader(superadmin.accessToken))
      .send({ role: 'admin' })
      .expect(200)

    expect(response.body.role).toBe('admin')
  })

  it('returns 403 when admin tries to change roles', async () => {
    const admin = await login('admin@jackaroo.local')
    const player = await login('player@jackaroo.local')

    await request(app)
      .patch(`/api/admin/users/${player.user.id}/role`)
      .set(authHeader(admin.accessToken))
      .send({ role: 'admin' })
      .expect(403)
  })

  it('does not allow assigning superadmin via API', async () => {
    const superadmin = await login('owner@example.com')
    const player = await login('player@jackaroo.local')

    await request(app)
      .patch(`/api/admin/users/${player.user.id}/role`)
      .set(authHeader(superadmin.accessToken))
      .send({ role: 'superadmin' as never })
      .expect(400)
  })
})
