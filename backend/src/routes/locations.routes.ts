import { Router } from 'express'
import { LocationController } from '../controllers/LocationController'
import { authMiddleware } from '../middleware/authMiddleware'
import { roleGuard } from '../middleware/roleGuard'
import { validateBody } from '../middleware/validate'
import { locationCreateSchema, locationUpdateSchema } from '../schemas'

export const locationsRouter = Router()

locationsRouter.use(authMiddleware, roleGuard('admin'))

locationsRouter.get('/', LocationController.list)
locationsRouter.get('/:id', LocationController.getById)
locationsRouter.post('/', validateBody(locationCreateSchema), LocationController.create)
locationsRouter.patch('/:id', validateBody(locationUpdateSchema), LocationController.update)
locationsRouter.patch('/:id/archive', LocationController.archive)
