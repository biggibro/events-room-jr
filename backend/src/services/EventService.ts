import type { EventStatus, Prisma, SeatingType } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../utils/errors'
import { deleteLocalUploadIfExists } from '../utils/uploads'

const eventDetailInclude = {
  location: true,
  participants: { include: { guests: true, user: true } },
  winners: {
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
  },
} satisfies Prisma.EventInclude

const eventListInclude = {
  location: true,
  participants: { include: { guests: true, user: true } },
} satisfies Prisma.EventInclude

type EventDetailWithRelations = Prisma.EventGetPayload<{
  include: typeof eventDetailInclude
}>

type EventListWithRelations = Prisma.EventGetPayload<{
  include: typeof eventListInclude
}>

function formatParticipantNote(guestCount: number): string {
  if (guestCount === 0) return 'Участник'
  if (guestCount === 1) return 'С гостем'
  return `С гостями (${guestCount})`
}

function mapWinner(winner: EventDetailWithRelations['winners'][number]) {
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

  return null
}

function mapEvent(event: EventListWithRelations) {
  const currentParticipants = event.participants.reduce(
    (sum, participant) => sum + 1 + participant.guests.length,
    0,
  )

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    eventDate: event.eventDate,
    eventTime: event.eventTime,
    location: event.location.name,
    locationAddress: event.location.address,
    locationMapUrl: event.location.mapUrl,
    locationId: event.locationId,
    maxParticipants: event.maxParticipants,
    currentParticipants,
    imageUrl: event.imageUrl ?? '',
    status: event.status,
    seatingType: event.seatingType,
    durationHours: event.durationHours,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    participantUserIds: event.participants.map((participant) => participant.userId),
  }
}

function mapEventDetail(event: EventDetailWithRelations) {
  return {
    ...mapEvent(event),
    participants: event.participants.map((participant) => ({
      userId: participant.userId,
      name: participant.user.name,
      avatarUrl: participant.user.avatarUrl ?? '',
      note: formatParticipantNote(participant.guests.length),
      guestNames: participant.guests.map((guest) => guest.name),
      guests: participant.guests.map((guest) => ({
        id: guest.id,
        name: guest.name,
      })),
    })),
    winners: event.winners
      .map(mapWinner)
      .filter((winner): winner is NonNullable<typeof winner> => winner !== null),
  }
}

export class EventService {
  private static buildListWhere(filters: {
    search?: string
    status?: EventStatus | 'ALL'
  }): Prisma.EventWhereInput {
    const where: Prisma.EventWhereInput = {
      status: { not: 'archived' },
    }

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status
    }

    if (filters.search?.trim()) {
      const q = filters.search.trim()
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { location: { name: { contains: q, mode: 'insensitive' } } },
        { location: { address: { contains: q, mode: 'insensitive' } } },
      ]
    }

    return where
  }

  static async list(filters: {
    search?: string
    status?: EventStatus | 'ALL'
    sort?: 'newest' | 'date'
    page?: number
    limit?: number
  }) {
    const where = EventService.buildListWhere(filters)

    const orderBy: Prisma.EventOrderByWithRelationInput[] =
      filters.sort === 'date'
        ? [{ eventDate: 'asc' }, { eventTime: 'asc' }]
        : [{ createdAt: 'desc' }]

    if (filters.page !== undefined && filters.limit !== undefined) {
      const page = filters.page
      const limit = filters.limit
      const skip = (page - 1) * limit

      const [total, events] = await Promise.all([
        prisma.event.count({ where }),
        prisma.event.findMany({
          where,
          include: eventListInclude,
          orderBy,
          skip,
          take: limit,
        }),
      ])

      return {
        items: events.map(mapEvent),
        total,
        page,
        limit,
        hasMore: skip + events.length < total,
      }
    }

    const events = await prisma.event.findMany({
      where,
      include: eventListInclude,
      orderBy,
    })

    return events.map(mapEvent)
  }

  static async getById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: eventDetailInclude,
    })
    if (!event) {
      throw new AppError(404, 'Событие не найдено')
    }
    return mapEventDetail(event)
  }

  static async create(
    adminId: string,
    data: {
      title: string
      description: string
      eventDate: string
      eventTime: string
      locationId: string
      maxParticipants: number
      seatingType?: SeatingType
      durationHours?: number
      imageUrl?: string
    },
  ) {
    const location = await prisma.location.findUnique({
      where: { id: data.locationId },
    })
    if (!location || location.isArchived) {
      throw new AppError(400, 'Локация не найдена или архивирована')
    }

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        locationId: data.locationId,
        createdByAdminId: adminId,
        maxParticipants: data.maxParticipants,
        seatingType: data.seatingType ?? 'free',
        durationHours: data.durationHours ?? 3,
        imageUrl: data.imageUrl,
        status: 'archived',
      },
      include: eventDetailInclude,
    })

    return mapEventDetail(event)
  }

  static async update(
    id: string,
    data: Partial<{
      title: string
      description: string
      eventDate: string
      eventTime: string
      locationId: string
      maxParticipants: number
      seatingType: SeatingType
      durationHours: number
      imageUrl: string
    }>,
  ) {
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) {
      throw new AppError(404, 'Событие не найдено')
    }

    if (data.locationId) {
      const location = await prisma.location.findUnique({
        where: { id: data.locationId },
      })
      if (!location || location.isArchived) {
        throw new AppError(400, 'Локация не найдена или архивирована')
      }
    }

    if (data.imageUrl !== undefined && data.imageUrl !== existing.imageUrl) {
      await deleteLocalUploadIfExists(existing.imageUrl)
    }

    const event = await prisma.event.update({
      where: { id },
      data,
      include: eventDetailInclude,
    })

    return mapEventDetail(event)
  }

  static async updateStatus(id: string, status: EventStatus) {
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) {
      throw new AppError(404, 'Событие не найдено')
    }
    if (status === 'archived') {
      throw new AppError(400, 'Используйте /archive для архивации')
    }

    const event = await prisma.event.update({
      where: { id },
      data: { status },
      include: eventDetailInclude,
    })

    return mapEventDetail(event)
  }

  static async archive(id: string) {
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) {
      throw new AppError(404, 'Событие не найдено')
    }

    const event = await prisma.event.update({
      where: { id },
      data: { status: 'archived' },
      include: eventDetailInclude,
    })

    return mapEventDetail(event)
  }
}
