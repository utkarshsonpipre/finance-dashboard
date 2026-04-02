// src/controllers/dashboardController.ts
// Route handlers for dashboard analytics endpoints

import type { Request, Response } from 'express'
import {
  getSummary,
  getCategoryTotals,
  getRecentTransactions,
  getMonthlyTrends,
} from '@/services/dashboardService'
import { sendSuccess, sendError } from '@/utils/response'

export async function summary(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getSummary()
    sendSuccess(res, data, 'Summary retrieved')
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export async function categoryTotals(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getCategoryTotals()
    sendSuccess(res, data, 'Category totals retrieved')
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export async function recentTransactions(req: Request, res: Response): Promise<void> {
  try {
    const limit = parseInt((req.query.limit as string) || '10', 10)
    const data = await getRecentTransactions(limit)
    sendSuccess(res, data, 'Recent transactions retrieved')
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export async function monthlyTrends(req: Request, res: Response): Promise<void> {
  try {
    const year = parseInt((req.query.year as string) || String(new Date().getFullYear()), 10)
    const data = await getMonthlyTrends(year)
    sendSuccess(res, data, 'Monthly trends retrieved')
  } catch (err: any) {
    sendError(res, err.message)
  }
}
