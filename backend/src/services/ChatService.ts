import { prisma } from '../lib/prisma'
import { AppError } from '../utils/errors'
import { chatMessageSchema } from '../schemas'

export type ChatMessageDto = {
  id: string
  eventId: string
  userId: string
  username: string
  text: string
  createdAt: string
}

function mapMessage(message: {
  id: string
  eventId: string
  userId: string
  message: string
  createdAt: Date
  user: { name: string }
}): ChatMessageDto {
  return {
    id: message.id,
    eventId: message.eventId,
    userId: message.userId,
    username: message.user.name,
    text: message.message,
    createdAt: message.createdAt.toISOString(),
  }
}

export class ChatService {
  static async assertParticipant(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    })

    if (!event) {
      throw new AppError(404, 'Событие не найдено')
    }

    const participant = await prisma.participant.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    })

    if (!participant) {
      throw new AppError(403, 'Чат доступен только записавшимся участникам')
    }
  }

  static async listMessages(eventId: string, userId: string): Promise<ChatMessageDto[]> {
    await ChatService.assertParticipant(eventId, userId)

    const messages = await prisma.eventMessage.findMany({
      where: { eventId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    })

    return messages.map(mapMessage)
  }

  static async createMessage(
    eventId: string,
    userId: string,
    rawMessage: string,
  ): Promise<ChatMessageDto> {
    await ChatService.assertParticipant(eventId, userId)

    const { message } = chatMessageSchema.parse({ message: rawMessage })

    const created = await prisma.eventMessage.create({
      data: {
        eventId,
        userId,
        message,
      },
      include: { user: { select: { name: true } } },
    })

    return mapMessage(created)
  }
}
