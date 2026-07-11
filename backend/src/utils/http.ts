import type { Response } from 'express'
import multer from 'multer'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { AppError, isAppError } from './errors'

function prismaClientMismatchMessage(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2022') {
    return 'Схема БД устарела. Выполните: npx prisma migrate dev (или docker compose restart api)'
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return 'Prisma Client устарел. Выполните: npx prisma generate (или docker compose restart api)'
  }

  return null
}

export function sendError(res: Response, error: unknown) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Файл слишком большой (макс. 1.5 MB)' })
    }
    return res.status(400).json({ error: 'Ошибка загрузки файла' })
  }

  if (isAppError(error)) {
    return res.status(error.statusCode).json({
      error: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    })
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Ошибка валидации',
      details: error.flatten(),
    })
  }

  const prismaMessage = prismaClientMismatchMessage(error)
  if (prismaMessage) {
    console.error(error)
    return res.status(500).json({ error: prismaMessage })
  }

  console.error(error)
  return res.status(500).json({ error: 'Внутренняя ошибка сервера' })
}
