import multer from 'multer'
import type { NextFunction, Request, Response } from 'express'
import { MAX_UPLOAD_BYTES, ALLOWED_MIME_TYPES } from '../utils/uploads'
import { AppError } from '../utils/errors'

const storage = multer.memoryStorage()

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) {
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
    return callback(new AppError(400, 'Допустимы только PNG, JPG и JPEG'))
  }
  return callback(null, true)
}

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter,
})

export function getUploadedFile(req: Request): Express.Multer.File {
  const file = req.file
  if (!file) {
    throw new AppError(400, 'Файл не передан')
  }
  return file
}
