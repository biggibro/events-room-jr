import { Router } from 'express'
import { UploadController } from '../controllers/UploadController'
import { authMiddleware } from '../middleware/authMiddleware'
import { roleGuard } from '../middleware/roleGuard'
import { uploadMiddleware } from '../middleware/uploadMiddleware'

export const uploadsRouter = Router()

uploadsRouter.post(
  '/avatar',
  authMiddleware,
  uploadMiddleware.single('file'),
  UploadController.uploadAvatar,
)

uploadsRouter.post(
  '/event-cover',
  authMiddleware,
  roleGuard('admin'),
  uploadMiddleware.single('file'),
  UploadController.uploadEventCover,
)

uploadsRouter.post(
  '/event-cover/:eventId',
  authMiddleware,
  roleGuard('admin'),
  uploadMiddleware.single('file'),
  UploadController.uploadEventCoverForEvent,
)
