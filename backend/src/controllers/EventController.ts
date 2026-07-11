import type { Request, Response, NextFunction } from 'express'
import type { EventStatus } from '@prisma/client'
import { EventService } from '../services/EventService'
import { JoinService } from '../services/JoinService'
import { WinnerService } from '../services/WinnerService'
import { ChatService } from '../services/ChatService'
import { paramId } from '../utils/params'
import type { eventsQuerySchema } from '../schemas'
import type { z } from 'zod'

type EventsQuery = z.infer<typeof eventsQuerySchema>

function getEventsQuery(req: Request): EventsQuery {
  return (req.validatedQuery as EventsQuery | undefined) ?? {}
}

export class EventController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getEventsQuery(req)
      const result = await EventService.list({
        search: query.search,
        status: query.status as EventStatus | 'ALL' | undefined,
        sort: query.sort,
        page: query.page,
        limit: query.limit,
      })
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventService.getById(paramId(req.params.id))
      return res.json(event)
    } catch (error) {
      return next(error)
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventService.create(req.user!.id, req.body)
      return res.status(201).json(event)
    } catch (error) {
      return next(error)
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventService.update(paramId(req.params.id), req.body)
      return res.json(event)
    } catch (error) {
      return next(error)
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventService.updateStatus(paramId(req.params.id), req.body.status)
      return res.json(event)
    } catch (error) {
      return next(error)
    }
  }

  static async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventService.archive(paramId(req.params.id))
      return res.json(event)
    } catch (error) {
      return next(error)
    }
  }

  static async join(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await JoinService.join(
        paramId(req.params.id),
        req.user!.id,
        req.body.guestNames ?? [],
      )
      return res.json(event)
    } catch (error) {
      return next(error)
    }
  }

  static async leave(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await JoinService.leave(paramId(req.params.id), req.user!.id)
      return res.json(event)
    } catch (error) {
      return next(error)
    }
  }

  static async removeParticipants(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await JoinService.removeParticipantsByAdmin(
        paramId(req.params.id),
        req.body.userIds,
      )
      return res.json(event)
    } catch (error) {
      return next(error)
    }
  }

  static async winners(req: Request, res: Response, next: NextFunction) {
    try {
      const winners = await WinnerService.replaceWinners(
        paramId(req.params.id),
        req.user!.id,
        req.body.winners,
      )
      return res.json(winners)
    } catch (error) {
      return next(error)
    }
  }

  static async messages(req: Request, res: Response, next: NextFunction) {
    try {
      const messages = await ChatService.listMessages(
        paramId(req.params.id),
        req.user!.id,
      )
      return res.json(messages)
    } catch (error) {
      return next(error)
    }
  }
}
