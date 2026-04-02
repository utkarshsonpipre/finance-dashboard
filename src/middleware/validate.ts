// src/middleware/validate.ts
// Zod request validation middleware factory

import type { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { sendError } from '@/utils/response'

/**
 * validate(schema) — validates req.body against a Zod schema.
 * On success it replaces req.body with the parsed (coerced) data.
 * On failure it returns a 400 with the first validation error message.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (err: any) {
      if (err instanceof ZodError) {
        const message = err.issues.map((e: any) => e.message).join('; ')
        sendError(res, message, 400)
        return
      }
      next(err)
    }
  }
}
