import request from 'supertest'
import { app } from './helpers'

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const response = await request(app).get('/api/health').expect(200)
    expect(response.body).toEqual({ ok: true })
  })
})
