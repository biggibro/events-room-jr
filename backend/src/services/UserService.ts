import { prisma } from '../lib/prisma'
import type { EventStatus } from '@prisma/client'

export class UserService {
  static async getUpcomingEvents(userId: string) {
    const participants = await prisma.participant.findMany({
      where: {
        userId,
        event: {
          status: { in: ['registration_open', 'registration_closed'] },
        },
      },
      include: {
        event: {
          include: { location: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return participants.map((participant) => ({
      id: participant.event.id,
      title: participant.event.title,
      date: participant.event.eventDate,
      time: participant.event.eventTime,
      location: participant.event.location.name,
      locationAddress: participant.event.location.address,
      imageUrl: participant.event.imageUrl ?? '',
      status: participant.event.status as EventStatus,
    }))
  }

  static async getStats(userId: string) {
    const [participants, winners, upcomingEvents] = await Promise.all([
      prisma.participant.findMany({
        where: {
          userId,
          event: { status: 'completed' },
        },
        include: { event: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.winner.findMany({
        where: { userId },
      }),
      UserService.getUpcomingEvents(userId),
    ])

    const winnerByEventId = new Map(winners.map((winner) => [winner.eventId, winner]))
    const officialWins = winners.reduce((sum, winner) => sum + winner.count, 0)
    const gamesPlayed = participants.length
    const winEventsCount = participants.filter((participant) =>
      winnerByEventId.has(participant.eventId),
    ).length
    const winrate =
      gamesPlayed > 0 ? `${Math.round((winEventsCount / gamesPlayed) * 100)}%` : '0%'

    const pastEvents = participants.map((participant) => {
      const winner = winnerByEventId.get(participant.eventId)

      return {
        id: participant.event.id,
        title: participant.event.title,
        date: participant.event.eventDate,
        wins: winner?.count,
        badge: winner ? ('win' as const) : ('other' as const),
        imageUrl: participant.event.imageUrl ?? '',
      }
    })

    return {
      officialWins,
      gamesPlayed,
      winrate,
      pastEvents,
      upcomingEvents,
    }
  }
}
