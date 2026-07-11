import { Router } from 'express'
import { AdminController } from '../controllers/AdminController'
import { authMiddleware } from '../middleware/authMiddleware'
import { roleGuard, superadminGuard } from '../middleware/roleGuard'
import { validateBody, validateQuery } from '../middleware/validate'
import { adminUsersQuerySchema, assignRoleSchema } from '../schemas'

export const adminRouter = Router()

adminRouter.get(
  '/users',
  authMiddleware,
  roleGuard('admin'),
  validateQuery(adminUsersQuerySchema),
  AdminController.listUsers,
)

adminRouter.patch(
  '/users/:id/role',
  authMiddleware,
  superadminGuard,
  validateBody(assignRoleSchema),
  AdminController.assignRole,
)

adminRouter.post(
  '/users/:id/block',
  authMiddleware,
  roleGuard('admin'),
  AdminController.blockUser,
)

adminRouter.delete(
  '/users/:id/block',
  authMiddleware,
  roleGuard('admin'),
  AdminController.unblockUser,
)
