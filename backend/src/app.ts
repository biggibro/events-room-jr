import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { adminRouter } from './routes/admin.routes'
import { authRouter } from './routes/auth.routes'
import { eventsRouter } from './routes/events.routes'
import { healthRouter } from './routes/health.routes'
import { locationsRouter } from './routes/locations.routes'
import { uploadsRouter } from './routes/uploads.routes'
import { userRouter } from './routes/user.routes'
import { swaggerSpec } from './swagger'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  )
  app.use(express.json())

  app.use('/uploads', express.static(env.UPLOAD_DIR))

  app.use('/api/health', healthRouter)
  app.use('/api/auth', authRouter)
  app.use('/api', userRouter)
  app.use('/api/locations', locationsRouter)
  app.use('/api/events', eventsRouter)
  app.use('/api/uploads', uploadsRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  app.use(errorHandler)

  return app
}
