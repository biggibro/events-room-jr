import { Router } from 'express'
import { EventController } from '../controllers/EventController'
import { authMiddleware } from '../middleware/authMiddleware'
import { roleGuard } from '../middleware/roleGuard'
import { validateBody, validateQuery } from '../middleware/validate'
import {
  eventCreateSchema,
  eventStatusSchema,
  eventUpdateSchema,
  eventsQuerySchema,
  joinSchema,
  removeParticipantsSchema,
  winnersSchema,
} from '../schemas'

export const eventsRouter = Router()

eventsRouter.get('/', validateQuery(eventsQuerySchema), EventController.list)
eventsRouter.get('/:id', EventController.getById)

eventsRouter.get(
  '/:id/messages',
  authMiddleware,
  EventController.messages,
)

eventsRouter.post(
  '/',
  authMiddleware,
  roleGuard('admin'),
  validateBody(eventCreateSchema),
  EventController.create,
)

eventsRouter.patch(
  '/:id',
  authMiddleware,
  roleGuard('admin'),
  validateBody(eventUpdateSchema),
  EventController.update,
)

eventsRouter.patch(
  '/:id/status',
  authMiddleware,
  roleGuard('admin'),
  validateBody(eventStatusSchema),
  EventController.updateStatus,
)

eventsRouter.patch(
  '/:id/archive',
  authMiddleware,
  roleGuard('admin'),
  EventController.archive,
)

eventsRouter.post(
  '/:id/join',
  authMiddleware,
  validateBody(joinSchema),
  EventController.join,
)

eventsRouter.delete(
  '/:id/join',
  authMiddleware,
  EventController.leave,
)

eventsRouter.delete(
  '/:id/participants',
  authMiddleware,
  roleGuard('admin'),
  validateBody(removeParticipantsSchema),
  EventController.removeParticipants,
)

eventsRouter.patch(
  '/:id/winners',
  authMiddleware,
  roleGuard('admin'),
  validateBody(winnersSchema),
  EventController.winners,
)
