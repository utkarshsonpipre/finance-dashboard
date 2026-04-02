// src/models/User.ts
// Mongoose schema and model for application users

import mongoose, { Schema } from 'mongoose'
import type { IUser, Role, UserStatus } from '@/types'

const ROLES: Role[] = ['viewer', 'analyst', 'admin']
const STATUSES: UserStatus[] = ['active', 'inactive']

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: [true, 'Clerk ID is required'],
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'viewer',
    },
    roleSelected: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'active',
    },
  },
  { timestamps: true }
)

export const User = mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)
