import type { NextFunction, Request, Response } from 'express'
import type { RoleName } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../utils/errors'
import { UserBlockService } from '../services/UserBlockService'
import { verifyAccessToken } from '../utils/tokens'

export type AuthUser = {
  id: string
  email: string
  role: RoleName
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Требуется авторизация'))
  }

  try {
    const token = header.slice('Bearer '.length)
    const payload = verifyAccessToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    })

    if (!user) {
      return next(new AppError(401, 'Пользователь не найден'))
    }

    await UserBlockService.assertNotBlocked(user.id)

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.name,
    }
    return next()
  } catch (error) {
    if (error instanceof AppError) {
      return next(error)
    }
    return next(new AppError(401, 'Недействительный токен'))
  }
}
