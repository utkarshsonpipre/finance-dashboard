// src/services/recordService.ts
// Business logic for financial record CRUD + filtering

import { z } from 'zod'
import { FinancialRecord } from '@/models/FinancialRecord'

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const CreateRecordSchema = z.object({
  amount: z.number({ message: 'Amount is required' }).positive('Amount must be positive'),
  type: z.enum(['income', 'expense'], { message: 'Type must be income or expense' }),
  category: z.string().min(1, 'Category is required').max(50),
  date: z.coerce.date({ message: 'Date is required' }),
  notes: z.string().max(500).optional(),
})

export const UpdateRecordSchema = CreateRecordSchema.partial()

export const RecordQuerySchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateRecordDto = z.infer<typeof CreateRecordSchema>
export type UpdateRecordDto = z.infer<typeof UpdateRecordSchema>
export type RecordQuery = z.infer<typeof RecordQuerySchema>

// ─── Service Functions ─────────────────────────────────────────────────────────

export async function createRecord(dto: CreateRecordDto) {
  return FinancialRecord.create(dto)
}

export async function getRecords(query: RecordQuery) {
  const { type, category, dateFrom, dateTo, search, page, limit } = query

  const filter: Record<string, unknown> = {}

  if (type) filter.type = type
  if (category) filter.category = { $regex: category, $options: 'i' }
  if (search) filter.notes = { $regex: search, $options: 'i' }
  if (dateFrom || dateTo) {
    filter.date = {
      ...(dateFrom ? { $gte: dateFrom } : {}),
      ...(dateTo ? { $lte: dateTo } : {}),
    }
  }

  const skip = (page - 1) * limit

  const [records, total] = await Promise.all([
    FinancialRecord.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
    FinancialRecord.countDocuments(filter),
  ])

  return {
    records,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getRecordById(id: string) {
  const record = await FinancialRecord.findById(id)
  if (!record) throw new Error('Record not found')
  return record
}

export async function updateRecord(id: string, dto: UpdateRecordDto) {
  const record = await FinancialRecord.findByIdAndUpdate(id, dto, {
    new: true,
    runValidators: true,
  })
  if (!record) throw new Error('Record not found')
  return record
}

export async function deleteRecord(id: string) {
  const record = await FinancialRecord.findByIdAndDelete(id)
  if (!record) throw new Error('Record not found')
  return record
}
