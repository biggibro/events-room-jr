import { prisma } from '../lib/prisma'
import { AppError } from '../utils/errors'

export class UserBlockService {
  static async isBlocked(userId: string): Promise<boolean> {
    const block = await prisma.userBlock.findUnique({
      where: { userId },
      select: { id: true },
    })
    return Boolean(block)
  }

  static async assertNotBlocked(userId: string) {
    if (await UserBlockService.isBlocked(userId)) {
      throw new AppError(403, 'Аккаунт заблокирован')
    }
  }

  private static async validateTarget(actorId: string, targetUserId: string) {
    if (actorId === targetUserId) {
      throw new AppError(400, 'Нельзя изменить блокировку для собственного аккаунта')
    }

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { role: true, block: true },
    })

    if (!target) {
      throw new AppError(404, 'Пользователь не найден')
    }

    if (target.role.name === 'superadmin') {
      throw new AppError(403, 'Нельзя заблокировать superadmin')
    }

    return target
  }

  static async block(actorId: string, targetUserId: string) {
    const target = await UserBlockService.validateTarget(actorId, targetUserId)

    if (target.block) {
      throw new AppError(409, 'Пользователь уже заблокирован')
    }

    await prisma.userBlock.create({
      data: {
        userId: targetUserId,
        blockedByAdminId: actorId,
      },
    })

    return {
      id: target.id,
      name: target.name,
      email: target.email,
      avatarUrl: target.avatarUrl,
      role: target.role.name,
      isBlocked: true,
    }
  }

  static async unblock(actorId: string, targetUserId: string) {
    const target = await UserBlockService.validateTarget(actorId, targetUserId)

    if (!target.block) {
      throw new AppError(404, 'Пользователь не заблокирован')
    }

    await prisma.userBlock.delete({
      where: { userId: targetUserId },
    })

    return UserBlockService.toAdminUser({ ...target, block: null })
  }

  private static toAdminUser(user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
    role: { name: string }
    block: { id: string } | null
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role.name,
      isBlocked: Boolean(user.block),
    }
  }
}
