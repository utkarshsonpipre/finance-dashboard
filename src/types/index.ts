// src/types/index.ts
// Shared TypeScript types across the application

import { Document, Types } from 'mongoose'

// ─── Roles ────────────────────────────────────────────────────────────────────

export type Role = 'viewer' | 'analyst' | 'admin'
export type UserStatus = 'active' | 'inactive'
export type RecordType = 'income' | 'expense'

// ─── User ─────────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  _id: Types.ObjectId
  clerkId: string
  name: string
  email: string
  role: Role
  roleSelected: boolean
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

// ─── Financial Record ─────────────────────────────────────────────────────────

export interface IFinancialRecord extends Document {
  _id: Types.ObjectId
  amount: number
  type: RecordType
  category: string
  date: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

// ─── Express Request Augmentation ─────────────────────────────────────────────

// Extends Express's Request to carry the decoded User role
declare global {
  namespace Express {
    interface Request {
      // The role fetched from MongoDB based on Clerk's req.auth.userId
      userRole?: Role
    }
  }
}
