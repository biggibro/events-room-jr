import path from 'node:path'
import fs from 'node:fs/promises'
import { env } from '../config/env'

export const ALLOWED_IMAGE_FORMATS = ['jpeg', 'png'] as const
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'] as const

export type AllowedImageFormat = (typeof ALLOWED_IMAGE_FORMATS)[number]

export const MAX_UPLOAD_BYTES = Math.floor(env.MAX_UPLOAD_SIZE_MB * 1024 * 1024)

export function getPublicUploadBaseUrl(): string {
  return env.PUBLIC_UPLOAD_BASE_URL.replace(/\/$/, '')
}

export function isLocalUploadUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return url.startsWith(`${getPublicUploadBaseUrl()}/`)
}

export function localUploadPathFromUrl(url: string): string | null {
  if (!isLocalUploadUrl(url)) return null
  const relative = url.slice(getPublicUploadBaseUrl().length + 1)
  const normalized = path.normalize(relative)
  if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
    return null
  }
  return path.join(env.UPLOAD_DIR, normalized)
}

export async function deleteLocalUploadIfExists(url: string | null | undefined): Promise<void> {
  if (!url || !isLocalUploadUrl(url)) return
  const filePath = localUploadPathFromUrl(url)
  if (!filePath) return
  try {
    await fs.unlink(filePath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
}
