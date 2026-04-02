// src/utils/response.ts
// Standardized API response helpers

import type { Response } from 'express'
import type { ApiResponse } from '@/types'

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  status = 200
): Response {
  const body: ApiResponse<T> = { success: true, message, data }
  return res.status(status).json(body)
}

export function sendError(
  res: Response,
  message = 'An error occurred',
  status = 500
): Response {
  const body: ApiResponse = { success: false, message }
  return res.status(status).json(body)
}
