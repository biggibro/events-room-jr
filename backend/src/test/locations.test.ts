import request from 'supertest'
import { app, authHeader, createLocation, login } from './helpers'

describe('Locations API', () => {
  it('lists locations for admin', async () => {
    const { accessToken } = await login('admin@jackaroo.local')
    await createLocation(accessToken, { name: 'Hall One' })
    await createLocation(accessToken, { name: 'Hall Two' })

    const response = await request(app)
      .get('/api/locations')
      .set(authHeader(accessToken))
      .expect(200)

    expect(response.body.length).toBeGreaterThanOrEqual(2)
  })

  it('gets location by id', async () => {
    const { accessToken } = await login('admin@jackaroo.local')
    const created = await createLocation(accessToken)

    const response = await request(app)
      .get(`/api/locations/${created.id}`)
      .set(authHeader(accessToken))
      .expect(200)

    expect(response.body.id).toBe(created.id)
    expect(response.body).toHaveProperty('description')
  })

  it('returns 404 for unknown location', async () => {
    const { accessToken } = await login('admin@jackaroo.local')
    await request(app)
      .get('/api/locations/00000000-0000-4000-8000-000000009999')
      .set(authHeader(accessToken))
      .expect(404)
  })

  it('creates location as admin', async () => {
    const { accessToken } = await login('admin@jackaroo.local')
    const response = await request(app)
      .post('/api/locations')
      .set(authHeader(accessToken))
      .send({
        name: 'New Hall',
        address: 'ул. Новая, 1',
        description: 'Новый зал для встреч',
        phone: '+7 (900) 111-22-33',
        mapUrl: 'https://yandex.ru/maps/-/CCUqY0V~',
      })
      .expect(201)

    expect(response.body.name).toBe('New Hall')
    expect(response.body.description).toBe('Новый зал для встреч')
    expect(response.body.phone).toBe('+7 (900) 111-22-33')
    expect(response.body.mapUrl).toBe('https://yandex.ru/maps/-/CCUqY0V~')
  })

  it('updates and archives location', async () => {
    const { accessToken } = await login('admin@jackaroo.local')
    const created = await request(app)
      .post('/api/locations')
      .set(authHeader(accessToken))
      .send({
        name: 'Temp Hall',
        address: 'ул. Временная, 2',
        description: 'Временная площадка',
      })
      .expect(201)

    const updated = await request(app)
      .patch(`/api/locations/${created.body.id}`)
      .set(authHeader(accessToken))
      .send({ name: 'Updated Hall', description: 'Обновлённое описание' })
      .expect(200)

    expect(updated.body.name).toBe('Updated Hall')
    expect(updated.body.description).toBe('Обновлённое описание')

    const archived = await request(app)
      .patch(`/api/locations/${created.body.id}/archive`)
      .set(authHeader(accessToken))
      .expect(200)

    expect(archived.body.isArchived).toBe(true)
  })

  it('returns 403 for regular user', async () => {
    const { accessToken } = await login('player@jackaroo.local')
    await request(app)
      .get('/api/locations')
      .set(authHeader(accessToken))
      .expect(403)
  })
})
