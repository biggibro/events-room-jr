import { prisma } from '../lib/prisma'
import { AppError } from '../utils/errors'
import { EventService } from './EventService'

export class JoinService {
  static async join(eventId: string, userId: string, guestNames: string[]) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: { include: { guests: true } },
      },
    })

    if (!event) {
      throw new AppError(404, 'Событие не найдено')
    }

    if (event.status !== 'registration_open') {
      throw new AppError(403, 'Регистрация на это событие закрыта')
    }

    const normalizedGuests = guestNames.map((name) => name.trim()).filter(Boolean)
    const slotsNeeded = 1 + normalizedGuests.length

    const existingParticipant = event.participants.find((p) => p.userId === userId)
    const occupiedWithoutCurrent = event.participants.reduce((sum, participant) => {
      if (participant.userId === userId) return sum
      return sum + 1 + participant.guests.length
    }, 0)

    if (occupiedWithoutCurrent + slotsNeeded > event.maxParticipants) {
      throw new AppError(409, 'Недостаточно свободных мест')
    }

    const participant = await prisma.participant.upsert({
      where: {
        eventId_userId: { eventId, userId },
      },
      create: { eventId, userId },
      update: {},
    })

    await prisma.guest.deleteMany({ where: { participantId: participant.id } })

    if (normalizedGuests.length > 0) {
      await prisma.guest.createMany({
        data: normalizedGuests.map((name) => ({
          participantId: participant.id,
          name,
        })),
      })
    }

    return EventService.getById(eventId)
  }

  static async leave(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      throw new AppError(404, 'Событие не найдено')
    }

    if (event.status !== 'registration_open') {
      throw new AppError(403, 'Регистрация на это событие закрыта')
    }

    const participant = await prisma.participant.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    })

    if (!participant) {
      throw new AppError(404, 'Вы не записаны на это событие')
    }

    await prisma.participant.delete({
      where: { id: participant.id },
    })

    return EventService.getById(eventId)
  }

  static async removeParticipantsByAdmin(eventId: string, userIds: string[]) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      throw new AppError(404, 'Событие не найдено')
    }

    const uniqueUserIds = [...new Set(userIds)]

    const participants = await prisma.participant.findMany({
      where: {
        eventId,
        userId: { in: uniqueUserIds },
      },
    })

    if (participants.length !== uniqueUserIds.length) {
      throw new AppError(404, 'Один или несколько участников не найдены')
    }

    await prisma.participant.deleteMany({
      where: {
        eventId,
        userId: { in: uniqueUserIds },
      },
    })

    return EventService.getById(eventId)
  }
}
