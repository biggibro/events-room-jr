import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { validateBody } from '../middleware/validate'
import { loginSchema, refreshSchema, registerSchema } from '../schemas'

export const authRouter = Router()

authRouter.post('/register', validateBody(registerSchema), AuthController.register)
authRouter.post('/login', validateBody(loginSchema), AuthController.login)
authRouter.post('/refresh', validateBody(refreshSchema), AuthController.refresh)
