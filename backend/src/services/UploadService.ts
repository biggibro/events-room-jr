import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { env } from '../config/env'
import { prisma } from '../lib/prisma'
import { AppError } from '../utils/errors'
import {
  ALLOWED_IMAGE_FORMATS,
  type AllowedImageFormat,
  deleteLocalUploadIfExists,
  getPublicUploadBaseUrl,
} from '../utils/uploads'

function resolveExtension(format: AllowedImageFormat, originalName?: string): string {
  if (format === 'png') return 'png'
  const lower = originalName?.toLowerCase() ?? ''
  if (lower.endsWith('.jpeg')) return 'jpeg'
  return 'jpg'
}

export class UploadService {
  static async validateImageBuffer(buffer: Buffer): Promise<AllowedImageFormat> {
    let metadata: Awaited<ReturnType<typeof sharp.prototype.metadata>>
    try {
      metadata = await sharp(buffer).metadata()
    } catch {
      throw new AppError(400, 'Допустимы только PNG, JPG и JPEG')
    }

    const format = metadata.format
    if (!format || !(ALLOWED_IMAGE_FORMATS as readonly string[]).includes(format)) {
      throw new AppError(400, 'Допустимы только PNG, JPG и JPEG')
    }

    return format as AllowedImageFormat
  }

  static async saveImage(
    buffer: Buffer,
    options: {
      subdir: 'avatars' | 'events'
      entityId: string
      originalName?: string
    },
  ): Promise<string> {
    const format = await UploadService.validateImageBuffer(buffer)
    const ext = resolveExtension(format, options.originalName)
    const filename = `${options.entityId}-${randomUUID()}.${ext}`
    const dir = path.join(env.UPLOAD_DIR, options.subdir)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, filename), buffer)
    return `${getPublicUploadBaseUrl()}/${options.subdir}/${filename}`
  }

  static async uploadAvatar(userId: string, buffer: Buffer, originalName?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })
    if (!user) {
      throw new AppError(404, 'Пользователь не найден')
    }

    const url = await UploadService.saveImage(buffer, {
      subdir: 'avatars',
      entityId: userId,
      originalName,
    })

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
      include: { role: true },
    })

    await deleteLocalUploadIfExists(user.avatarUrl)

    return {
      url,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        avatarUrl: updated.avatarUrl,
        bio: updated.bio ?? '',
        tagline: updated.tagline ?? '',
        role: updated.role.name,
      },
    }
  }

  static async uploadEventCover(
    buffer: Buffer,
    options?: { originalName?: string; eventId?: string; adminId?: string },
  ) {
    if (options?.eventId) {
      const event = await prisma.event.findUnique({
        where: { id: options.eventId },
      })
      if (!event) {
        throw new AppError(404, 'Событие не найдено')
      }
      if (event.createdByAdminId !== options.adminId) {
        throw new AppError(403, 'Недостаточно прав для загрузки обложки события')
      }
    }

    const entityId = options?.eventId ?? `draft-${randomUUID()}`
    const url = await UploadService.saveImage(buffer, {
      subdir: 'events',
      entityId,
      originalName: options?.originalName,
    })

    return { url }
  }
}
