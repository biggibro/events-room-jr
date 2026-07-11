import type { Request, Response, NextFunction } from 'express'
import { LocationService } from '../services/LocationService'
import { paramId } from '../utils/params'

export class LocationController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const includeArchived = req.query.includeArchived === 'true'
      const locations = await LocationService.list(includeArchived)
      return res.json(locations)
    } catch (error) {
      return next(error)
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await LocationService.getById(paramId(req.params.id))
      return res.json(location)
    } catch (error) {
      return next(error)
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await LocationService.create(req.user!.id, req.body)
      return res.status(201).json(location)
    } catch (error) {
      return next(error)
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await LocationService.update(paramId(req.params.id), req.body)
      return res.json(location)
    } catch (error) {
      return next(error)
    }
  }

  static async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await LocationService.archive(paramId(req.params.id))
      return res.json(location)
    } catch (error) {
      return next(error)
    }
  }
}
