import bcrypt from 'bcryptjs'
import type { RoleName } from '@prisma/client'
import { env } from '../config/env'
import { prisma } from '../lib/prisma'
import { AppError } from '../utils/errors'
import { deleteLocalUploadIfExists } from '../utils/uploads'
import { UserBlockService } from '../services/UserBlockService'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens'

function resolveRoleForEmail(email: string): RoleName {
  if (email.toLowerCase() === env.SUPERADMIN_EMAIL.toLowerCase()) {
    return 'superadmin'
  }
  return 'user'
}

async function getRoleId(name: RoleName) {
  const role = await prisma.role.findUnique({ where: { name } })
  if (!role) {
    throw new AppError(500, `Роль ${name} не найдена`)
  }
  return role.id
}

function toPublicUser(user: {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  bio: string | null
  tagline: string | null
  role: { name: RoleName }
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio ?? '',
    tagline: user.tagline ?? '',
    role: user.role.name,
  }
}

export class AuthService {
  static async register(input: { email: string; password: string; name: string }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } })
    if (existing) {
      throw new AppError(409, 'Пользователь с таким email уже существует')
    }

    const roleName = resolveRoleForEmail(input.email)
    const roleId = await getRoleId(roleName)
    const passwordHash = await bcrypt.hash(input.password, 10)

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        roleId,
      },
      include: { role: true },
    })

    return AuthService.issueTokens(user)
  }

  static async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: { role: true },
    })

    if (!user) {
      throw new AppError(401, 'Неверный email или пароль')
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash)
    if (!valid) {
      throw new AppError(401, 'Неверный email или пароль')
    }

    await UserBlockService.assertNotBlocked(user.id)

    const superadminRoleId = await getRoleId('superadmin')
    const shouldBeSuperadmin =
      user.email.toLowerCase() === env.SUPERADMIN_EMAIL.toLowerCase()

    let currentUser = user
    if (shouldBeSuperadmin && user.role.name !== 'superadmin') {
      currentUser = await prisma.user.update({
        where: { id: user.id },
        data: { roleId: superadminRoleId },
        include: { role: true },
      })
    }

    return AuthService.issueTokens(currentUser)
  }

  static async refresh(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken)
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      })
      if (!user) {
        throw new AppError(401, 'Пользователь не найден')
      }
      await UserBlockService.assertNotBlocked(user.id)
      return AuthService.issueTokens(user)
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError(401, 'Недействительный refresh-токен')
    }
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })
    if (!user) {
      throw new AppError(404, 'Пользователь не найден')
    }
    return toPublicUser(user)
  }

  static async updateProfile(
    userId: string,
    data: { name?: string; tagline?: string; bio?: string; avatarUrl?: string },
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })
    if (!user) {
      throw new AppError(404, 'Пользователь не найден')
    }

    if (data.avatarUrl !== undefined && data.avatarUrl !== user.avatarUrl) {
      await deleteLocalUploadIfExists(user.avatarUrl)
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.tagline !== undefined ? { tagline: data.tagline } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      },
      include: { role: true },
    })

    return toPublicUser(updated)
  }

  static async updateCredentials(
    userId: string,
    data: { email?: string; currentPassword: string; newPassword?: string },
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })
    if (!user) {
      throw new AppError(404, 'Пользователь не найден')
    }

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash)
    if (!valid) {
      throw new AppError(401, 'Неверный текущий пароль')
    }

    const updateData: {
      email?: string
      passwordHash?: string
      roleId?: string
    } = {}

    if (data.email !== undefined) {
      const normalizedEmail = data.email.toLowerCase()
      if (normalizedEmail !== user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        })
        if (existing && existing.id !== userId) {
          throw new AppError(409, 'Пользователь с таким email уже существует')
        }
        updateData.email = normalizedEmail
        const roleName = resolveRoleForEmail(normalizedEmail)
        if (roleName !== user.role.name) {
          updateData.roleId = await getRoleId(roleName)
        }
      }
    }

    if (data.newPassword !== undefined) {
      updateData.passwordHash = await bcrypt.hash(data.newPassword, 10)
    }

    if (Object.keys(updateData).length === 0) {
      return toPublicUser(user)
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { role: true },
    })

    return toPublicUser(updated)
  }

  private static issueTokens(user: {
    id: string
    email: string
    name: string
    avatarUrl: string | null
    bio: string | null
    tagline: string | null
    role: { name: RoleName }
  }) {
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    })
    const refreshToken = signRefreshToken({ sub: user.id })
    return {
      accessToken,
      refreshToken,
      user: toPublicUser(user),
    }
  }
}
