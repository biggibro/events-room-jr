import type { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/AuthService'

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body)
      return res.status(201).json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body)
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.refresh(req.body.refreshToken)
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }
}
