import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import request from 'supertest'
import { env } from '../config/env'
import { app, authHeader, createLocation, login } from './helpers'

async function createTestPng(): Promise<Buffer> {
  return sharp({
    create: {
      width: 32,
      height: 24,
      channels: 3,
      background: { r: 120, g: 80, b: 200 },
    },
  })
    .png()
    .toBuffer()
}

async function createTestJpeg(): Promise<Buffer> {
  return sharp({
    create: {
      width: 40,
      height: 30,
      channels: 3,
      background: { r: 200, g: 120, b: 60 },
    },
  })
    .jpeg()
    .toBuffer()
}

describe('Uploads API', () => {
  it('uploads avatar as PNG and updates profile', async () => {
    const { accessToken, user } = await login('player@jackaroo.local')
    const png = await createTestPng()

    const response = await request(app)
      .post('/api/uploads/avatar')
      .set(authHeader(accessToken))
      .attach('file', png, { filename: 'avatar.png', contentType: 'image/png' })
      .expect(200)

    expect(response.body.url).toMatch(/^\/uploads\/avatars\//)
    expect(response.body.user.avatarUrl).toBe(response.body.url)

    const relativePath = response.body.url.replace('/uploads/', '')
    const saved = await fs.readFile(path.join(env.UPLOAD_DIR, relativePath))
    expect(saved.equals(png)).toBe(true)

    const me = await request(app)
      .get('/api/me')
      .set(authHeader(accessToken))
      .expect(200)

    expect(me.body.avatarUrl).toBe(response.body.url)
    expect(me.body.id).toBe(user.id)
  })

  it('replaces avatar and removes previous local file', async () => {
    const { accessToken } = await login('marina@jackaroo.local')
    const first = await request(app)
      .post('/api/uploads/avatar')
      .set(authHeader(accessToken))
      .attach('file', await createTestPng(), {
        filename: 'first.png',
        contentType: 'image/png',
      })
      .expect(200)

    const firstPath = path.join(
      env.UPLOAD_DIR,
      first.body.url.replace('/uploads/', ''),
    )

    await request(app)
      .post('/api/uploads/avatar')
      .set(authHeader(accessToken))
      .attach('file', await createTestJpeg(), {
        filename: 'second.jpg',
        contentType: 'image/jpeg',
      })
      .expect(200)

    await expect(fs.access(firstPath)).rejects.toThrow()
  })

  it('uploads event cover as admin', async () => {
    const { accessToken } = await login('admin@jackaroo.local')
    const jpeg = await createTestJpeg()

    const response = await request(app)
      .post('/api/uploads/event-cover')
      .set(authHeader(accessToken))
      .attach('file', jpeg, { filename: 'cover.jpg', contentType: 'image/jpeg' })
      .expect(200)

    expect(response.body.url).toMatch(/^\/uploads\/events\//)

    const relativePath = response.body.url.replace('/uploads/', '')
    const saved = await fs.readFile(path.join(env.UPLOAD_DIR, relativePath))
    expect(saved.equals(jpeg)).toBe(true)
  })

  it('rejects non-admin event cover upload', async () => {
    const { accessToken } = await login('player@jackaroo.local')

    await request(app)
      .post('/api/uploads/event-cover')
      .set(authHeader(accessToken))
      .attach('file', await createTestPng(), {
        filename: 'cover.png',
        contentType: 'image/png',
      })
      .expect(403)
  })

  it('rejects files larger than 1.5 MB', async () => {
    const { accessToken } = await login('player@jackaroo.local')
    const oversized = Buffer.alloc(Math.floor(1.5 * 1024 * 1024) + 1, 0)

    await request(app)
      .post('/api/uploads/avatar')
      .set(authHeader(accessToken))
      .attach('file', oversized, {
        filename: 'big.jpg',
        contentType: 'image/jpeg',
      })
      .expect(400)
  })

  it('rejects unsupported image formats', async () => {
    const { accessToken } = await login('player@jackaroo.local')
    const webp = await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 3,
        background: { r: 10, g: 10, b: 10 },
      },
    })
      .webp()
      .toBuffer()

    await request(app)
      .post('/api/uploads/avatar')
      .set(authHeader(accessToken))
      .attach('file', webp, { filename: 'avatar.webp', contentType: 'image/webp' })
      .expect(400)
  })

  it('accepts local upload URL in event create', async () => {
    const { accessToken } = await login('admin@jackaroo.local')
    const upload = await request(app)
      .post('/api/uploads/event-cover')
      .set(authHeader(accessToken))
      .attach('file', await createTestPng(), {
        filename: 'event.png',
        contentType: 'image/png',
      })
      .expect(200)

    const location = await createLocation(accessToken)
    const locationId = location.id

    const created = await request(app)
      .post('/api/events')
      .set(authHeader(accessToken))
      .send({
        title: 'Событие с обложкой',
        description: 'Описание',
        eventDate: '2026-12-01',
        eventTime: '18:00',
        locationId,
        maxParticipants: 10,
        imageUrl: upload.body.url,
      })
      .expect(201)

    expect(created.body.imageUrl).toBe(upload.body.url)
  })

  it('returns 401 without token', async () => {
    await request(app)
      .post('/api/uploads/avatar')
      .attach('file', await createTestPng(), {
        filename: 'avatar.png',
        contentType: 'image/png',
      })
      .expect(401)
  })
})
