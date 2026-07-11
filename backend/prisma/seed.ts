import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userRole = await prisma.role.findUniqueOrThrow({ where: { name: 'user' } })
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'admin' } })
  const superadminRole = await prisma.role.findUniqueOrThrow({
    where: { name: 'superadmin' },
  })

  const passwordHash = await bcrypt.hash('password123', 10)
  const superadminEmail = (process.env.SUPERADMIN_EMAIL ?? 'owner@example.com').toLowerCase()

  await prisma.user.upsert({
    where: { email: superadminEmail },
    update: { roleId: superadminRole.id },
    create: {
      email: superadminEmail,
      passwordHash,
      name: 'Super Admin',
      roleId: superadminRole.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@jackaroo.local' },
    update: {},
    create: {
      email: 'admin@jackaroo.local',
      passwordHash,
      name: 'Администратор',
      roleId: adminRole.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'player@jackaroo.local' },
    update: {
      bio: 'Играю в Jackaroo на встречах города и слежу за статистикой побед.',
      tagline: 'Игрок Jackaroo',
    },
    create: {
      email: 'player@jackaroo.local',
      passwordHash,
      name: 'Алексей',
      roleId: userRole.id,
      bio: 'Играю в Jackaroo на встречах города и слежу за статистикой побед.',
      tagline: 'Игрок Jackaroo',
    },
  })

  await prisma.user.upsert({
    where: { email: 'marina@jackaroo.local' },
    update: {},
    create: {
      email: 'marina@jackaroo.local',
      passwordHash,
      name: 'Марина',
      roleId: userRole.id,
    },
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
