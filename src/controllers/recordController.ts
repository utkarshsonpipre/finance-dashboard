// src/controllers/recordController.ts
// Route handlers for financial record CRUD

import type { Request, Response } from 'express'
import {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
  RecordQuerySchema,
  UpdateRecordSchema,
} from '@/services/recordService'
import { sendSuccess, sendError } from '@/utils/response'
import { ZodError } from 'zod'

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const record = await createRecord(req.body) // already validated by middleware
    sendSuccess(res, record, 'Record created', 201)
  } catch (err: any) {
    sendError(res, err.message, 400)
  }
}

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const query = RecordQuerySchema.parse(req.query)
    const result = await getRecords(query)
    sendSuccess(res, result, 'Records retrieved')
  } catch (err: any) {
    if (err instanceof ZodError) {
      sendError(res, err.issues.map((e: any) => e.message).join('; '), 400)
      return
    }
    sendError(res, err.message, 400)
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const dto = UpdateRecordSchema.parse(req.body)
    const record = await updateRecord(req.params.id as string, dto)
    sendSuccess(res, record, 'Record updated')
  } catch (err: any) {
    const status = err.message === 'Record not found' ? 404 : 400
    sendError(res, err.message, status)
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await deleteRecord(req.params.id as string)
    sendSuccess(res, null, 'Record deleted')
  } catch (err: any) {
    sendError(res, err.message, err.message === 'Record not found' ? 404 : 400)
  }
}
