// src/app.ts
// Express application factory — mounts all API routes and global middleware

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { rateLimiter } from '@/middleware/rateLimiter'
import { errorHandler } from '@/middleware/errorHandler'
import recordRoutes from '@/routes/recordRoutes'
import dashboardRoutes from '@/routes/dashboardRoutes'
import userRoutes from '@/routes/userRoutes'

export function createExpressApp() {
  const app = express()

  // ── Global Middleware ────────────────────────────────────────────────────────
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }))
  app.use(express.json({ limit: '10kb' }))
  app.use(express.urlencoded({ extended: true }))

  // HTTP request logger (skip in test environment)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'))
  }

  // Apply general rate limiter globally
  app.use('/api', rateLimiter)

  // ── API Routes ────────────────────────────────────────────────────────────────
  app.use('/api/users', userRoutes)
  app.use('/api/records', recordRoutes)
  app.use('/api/dashboard', dashboardRoutes)

  // ── Health Check ──────────────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Finance Dashboard API is running' })
  })

  // ── Global Error Handler (must be last) ───────────────────────────────────────
  app.use(errorHandler)

  return app
}
