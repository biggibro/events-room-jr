import type { Server as HttpServer } from 'http'
import type { RoleName } from '@prisma/client'
import { Server } from 'socket.io'
import { env } from '../config/env'
import { prisma } from '../lib/prisma'
import { joinEventSocketSchema, sendMessageSocketSchema } from '../schemas'
import { ChatService } from '../services/ChatService'
import { UserBlockService } from '../services/UserBlockService'
import { AppError } from '../utils/errors'
import { verifyAccessToken } from '../utils/tokens'

type SocketUser = {
  id: string
  email: string
  role: RoleName
}

function eventRoom(eventId: string) {
  return `event:${eventId}`
}

function resolveErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AppError) return error.message
  if (error instanceof Error) return error.message
  return fallback
}

export function initSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
    path: '/socket.io',
  })

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token as string | undefined
      if (!token) {
        return next(new Error('Требуется авторизация'))
      }

      const payload = verifyAccessToken(token)
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      })

      if (!user) {
        return next(new Error('Пользователь не найден'))
      }

      await UserBlockService.assertNotBlocked(user.id)

      socket.data.user = {
        id: user.id,
        email: user.email,
        role: user.role.name,
      } satisfies SocketUser
      return next()
    } catch {
      return next(new Error('Недействительный токен'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.data.user as SocketUser

    socket.on('joinEvent', async (payload, ack) => {
      try {
        const { eventId } = joinEventSocketSchema.parse(payload)
        await ChatService.assertParticipant(eventId, user.id)
        await socket.join(eventRoom(eventId))
        ack?.({ ok: true })
      } catch (error) {
        const message = resolveErrorMessage(error, 'Ошибка при входе в чат')
        socket.emit('error', { message })
        ack?.({ ok: false, message })
      }
    })

    socket.on('sendMessage', async (payload, ack) => {
      try {
        const { eventId, message } = sendMessageSocketSchema.parse(payload)
        const dto = await ChatService.createMessage(eventId, user.id, message)
        io.to(eventRoom(eventId)).emit('newMessage', dto)
        ack?.({ ok: true, message: dto })
      } catch (error) {
        const message = resolveErrorMessage(error, 'Не удалось отправить сообщение')
        socket.emit('error', { message })
        ack?.({ ok: false, message })
      }
    })
  })

  return io
}
