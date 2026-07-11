import type { Request, Response } from 'express'
import { AuthService } from '../services/AuthService'
import { UserService } from '../services/UserService'
import { sendError } from '../utils/http'
import { paramId } from '../utils/params'
import { isAdminRole } from '../utils/roles'

export class UserController {
  static async me(req: Request, res: Response) {
    try {
      const user = await AuthService.getMe(req.user!.id)
      return res.json(user)
    } catch (error) {
      return sendError(res, error)
    }
  }

  static async stats(req: Request, res: Response) {
    try {
      const stats = await UserService.getStats(req.user!.id)
      return res.json(stats)
    } catch (error) {
      return sendError(res, error)
    }
  }

  static async profileById(req: Request, res: Response) {
    try {
      const targetId = paramId(req.params.id)
      const viewer = req.user!
      const user = await AuthService.getMe(targetId)
      const stats = await UserService.getStats(targetId)
      const showEmail = targetId === viewer.id || isAdminRole(viewer.role)

      return res.json({
        id: user.id,
        ...(showEmail ? { email: user.email } : {}),
        name: user.name,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        tagline: user.tagline,
        role: user.role,
        officialWins: stats.officialWins,
        gamesPlayed: stats.gamesPlayed,
        winrate: stats.winrate,
        pastEvents: stats.pastEvents,
        upcomingEvents: stats.upcomingEvents,
      })
    } catch (error) {
      return sendError(res, error)
    }
  }

  static async updateMe(req: Request, res: Response) {
    try {
      const user = await AuthService.updateProfile(req.user!.id, req.body)
      return res.json(user)
    } catch (error) {
      return sendError(res, error)
    }
  }

  static async updateCredentials(req: Request, res: Response) {
    try {
      const user = await AuthService.updateCredentials(req.user!.id, req.body)
      return res.json(user)
    } catch (error) {
      return sendError(res, error)
    }
  }
}
