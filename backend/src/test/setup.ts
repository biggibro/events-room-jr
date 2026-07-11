import { execSync } from 'node:child_process'
import { prisma } from '../lib/prisma'

beforeAll(async () => {
  if (process.env.DATABASE_URL_TEST) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST
  }
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env,
  })
})

beforeEach(async () => {
  await prisma.guest.deleteMany()
  await prisma.eventMessage.deleteMany()
  await prisma.participant.deleteMany()
  await prisma.winner.deleteMany()
  await prisma.event.deleteMany()
  await prisma.location.deleteMany()
  await prisma.userBlock.deleteMany()
  await prisma.user.deleteMany()

  execSync('npx tsx prisma/seed.ts', {
    stdio: 'pipe',
    env: process.env,
  })
})

afterAll(async () => {
  await prisma.$disconnect()
})
