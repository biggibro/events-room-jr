import { prisma } from '../lib/prisma'
import { AppError } from '../utils/errors'

export type WinnerInput =
  | { userId: string; count: number }
  | { guestId: string; count: number }

function mapWinnerResponse(
  winner: {
    userId: string | null
    guestId: string | null
    count: number
    user: { id: string; name: string } | null
    guest: {
      id: string
      name: string
      participant: { user: { name: string } }
    } | null
  },
) {
  if (winner.userId && winner.user) {
    return {
      type: 'user' as const,
      userId: winner.userId,
      name: winner.user.name,
      count: winner.count,
    }
  }

  if (winner.guestId && winner.guest) {
    return {
      type: 'guest' as const,
      guestId: winner.guestId,
      name: winner.guest.name,
      hostName: winner.guest.participant.user.name,
      count: winner.count,
    }
  }

  throw new AppError(500, 'Некорректная запись победителя')
}

export class WinnerService {
  static async replaceWinners(
    eventId: string,
    adminId: string,
    winners: WinnerInput[],
  ) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: { select: { userId: true } },
      },
    })
    if (!event) {
      throw new AppError(404, 'Событие не найдено')
    }

    const participantUserIds = new Set(event.participants.map((p) => p.userId))

    for (const winner of winners) {
      if (winner.count < 1) {
        throw new AppError(400, 'Количество побед должно быть >= 1')
      }

      if ('userId' in winner) {
        if (!participantUserIds.has(winner.userId)) {
          throw new AppError(400, 'Победитель должен быть участником события')
        }
        continue
      }

      const guest = await prisma.guest.findUnique({
        where: { id: winner.guestId },
        include: { participant: true },
      })
      if (!guest || guest.participant.eventId !== eventId) {
        throw new AppError(400, 'Гость не найден на этом событии')
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.winner.deleteMany({ where: { eventId } })
      if (winners.length > 0) {
        await tx.winner.createMany({
          data: winners.map((winner) => ({
            eventId,
            userId: 'userId' in winner ? winner.userId : null,
            guestId: 'guestId' in winner ? winner.guestId : null,
            count: winner.count,
            assignedByAdminId: adminId,
          })),
        })
      }
    })

    const savedWinners = await prisma.winner.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, name: true } },
        guest: {
          select: {
            id: true,
            name: true,
            participant: { select: { user: { select: { name: true } } } },
          },
        },
      },
    })

    return savedWinners.map(mapWinnerResponse)
  }
}
