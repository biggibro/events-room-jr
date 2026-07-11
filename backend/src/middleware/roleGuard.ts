import type { NextFunction, Request, Response } from 'express'
import type { RoleName } from '@prisma/client'
import { AppError } from '../utils/errors'
import { canManageAdminResources, isSuperadminRole } from '../utils/roles'

export function roleGuard(...allowed: RoleName[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Требуется авторизация'))
    }

    const role = req.user.role
    const expanded = new Set<RoleName>(allowed)

    if (allowed.includes('admin')) {
      if (canManageAdminResources(role)) {
        return next()
      }
    }

    if (expanded.has(role)) {
      return next()
    }

    return next(new AppError(403, 'Недостаточно прав'))
  }
}

export function superadminGuard(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError(401, 'Требуется авторизация'))
  }
  if (!isSuperadminRole(req.user.role)) {
    return next(new AppError(403, 'Только superadmin'))
  }
  return next()
}
