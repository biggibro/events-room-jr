import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { authMiddleware } from '../middleware/authMiddleware'
import { validateBody } from '../middleware/validate'
import { credentialsUpdateSchema, profileUpdateSchema } from '../schemas'

export const userRouter = Router()

userRouter.get('/me', authMiddleware, UserController.me)
userRouter.get('/me/stats', authMiddleware, UserController.stats)
userRouter.get('/users/:id/profile', authMiddleware, UserController.profileById)
userRouter.patch('/me', authMiddleware, validateBody(profileUpdateSchema), UserController.updateMe)
userRouter.patch(
  '/me/credentials',
  authMiddleware,
  validateBody(credentialsUpdateSchema),
  UserController.updateCredentials,
)
