import type { NextFunction, Request, Response } from 'express'
import { UploadService } from '../services/UploadService'
import { getUploadedFile } from '../middleware/uploadMiddleware'
import { paramId } from '../utils/params'

export class UploadController {
  static async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const file = getUploadedFile(req)
      const result = await UploadService.uploadAvatar(req.user!.id, file.buffer, file.originalname)
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async uploadEventCover(req: Request, res: Response, next: NextFunction) {
    try {
      const file = getUploadedFile(req)
      const result = await UploadService.uploadEventCover(file.buffer, {
        originalName: file.originalname,
      })
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async uploadEventCoverForEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const file = getUploadedFile(req)
      const result = await UploadService.uploadEventCover(file.buffer, {
        originalName: file.originalname,
        eventId: paramId(req.params.eventId),
        adminId: req.user!.id,
      })
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }
}
