// src/models/FinancialRecord.ts
// Mongoose schema and model for financial records

import mongoose, { Schema } from 'mongoose'
import type { IFinancialRecord, RecordType } from '@/types'

const RECORD_TYPES: RecordType[] = ['income', 'expense']

const FinancialRecordSchema = new Schema<IFinancialRecord>(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be a positive number'],
    },
    type: {
      type: String,
      enum: RECORD_TYPES,
      required: [true, 'Type (income/expense) is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
)

// Compound index for efficient date-range + type queries
FinancialRecordSchema.index({ date: -1, type: 1, category: 1 })

export const FinancialRecord =
  mongoose.models.FinancialRecord ??
  mongoose.model<IFinancialRecord>('FinancialRecord', FinancialRecordSchema)
