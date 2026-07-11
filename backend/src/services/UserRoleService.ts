import type { RoleName } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../utils/errors'

export class UserRoleService {
  static async assignRole(
    actorId: string,
    targetUserId: string,
    role: Extract<RoleName, 'admin' | 'user'>,
  ) {
    if (actorId === targetUserId) {
      throw new AppError(400, 'Нельзя изменить собственную роль')
    }

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { role: true },
    })

    if (!target) {
      throw new AppError(404, 'Пользователь не найден')
    }

    if (target.role.name === 'superadmin') {
      throw new AppError(403, 'Нельзя изменить роль superadmin')
    }

    const roleRecord = await prisma.role.findUnique({ where: { name: role } })
    if (!roleRecord) {
      throw new AppError(500, `Роль ${role} не найдена`)
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { roleId: roleRecord.id },
      include: { role: true },
    })

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role.name,
    }
  }
}
