import type { RoleName } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

export class AdminUserService {
  static async list(filters: {
    search?: string
    role?: RoleName | 'ALL'
    blocked?: 'ALL' | 'blocked'
  }) {
    const where: Prisma.UserWhereInput = {}

    if (filters.role && filters.role !== 'ALL') {
      where.role = { name: filters.role }
    }

    if (filters.blocked === 'blocked') {
      where.block = { isNot: null }
    }

    if (filters.search?.trim()) {
      const q = filters.search.trim()
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      include: { role: true, block: true },
      orderBy: { name: 'asc' },
    })

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role.name,
      isBlocked: Boolean(user.block),
    }))
  }
}
