// src/middleware/errorHandler.ts
// Global Express error-handling middleware

import type { Request, Response, NextFunction } from 'express'
import { sendError } from '@/utils/response'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  console.error('[ErrorHandler]', err)

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    sendError(res, 'A record with that value already exists', 409)
    return
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    sendError(res, err.message, 400)
    return
  }

  sendError(res, err.message || 'Internal server error', 500)
}
