import type { Request, Response, NextFunction } from 'express'
import type { z } from 'zod'
import type { adminUsersQuerySchema } from '../schemas'
import { AdminUserService } from '../services/AdminUserService'
import { UserBlockService } from '../services/UserBlockService'
import { UserRoleService } from '../services/UserRoleService'
import { paramId } from '../utils/params'

type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>

export class AdminController {
  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.validatedQuery as AdminUsersQuery
      const users = await AdminUserService.list({
        search: query.search,
        role: query.role ?? 'ALL',
        blocked: query.blocked ?? 'ALL',
      })
      return res.json(users)
    } catch (error) {
      return next(error)
    }
  }

  static async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserBlockService.block(req.user!.id, paramId(req.params.id))
      return res.json(user)
    } catch (error) {
      return next(error)
    }
  }

  static async unblockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserBlockService.unblock(req.user!.id, paramId(req.params.id))
      return res.json(user)
    } catch (error) {
      return next(error)
    }
  }

  static async assignRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserRoleService.assignRole(
        req.user!.id,
        paramId(req.params.id),
        req.body.role,
      )
      return res.json(user)
    } catch (error) {
      return next(error)
    }
  }
}
