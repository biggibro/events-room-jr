import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'
import { sendError } from '../utils/http'

declare module 'express-serve-static-core' {
  interface Request {
    validatedQuery?: unknown
  }
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return sendError(_res, result.error)
    }
    req.body = result.data
    return next()
  }
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      return sendError(_res, result.error)
    }
    req.validatedQuery = result.data
    return next()
  }
}
