// src/services/dashboardService.ts
// MongoDB aggregation pipelines for dashboard analytics

import { FinancialRecord } from '@/models/FinancialRecord'

/**
 * Returns total income, total expenses, and net balance.
 */
export async function getSummary() {
  const result = await FinancialRecord.aggregate([
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ])

  const income = result.find((r) => r._id === 'income')?.total ?? 0
  const expenses = result.find((r) => r._id === 'expense')?.total ?? 0

  return {
    totalIncome: income,
    totalExpenses: expenses,
    netBalance: income - expenses,
  }
}

/**
 * Returns totals grouped by category, separated by type.
 */
export async function getCategoryTotals() {
  return FinancialRecord.aggregate([
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
    { $sort: { total: -1 } },
  ])
}

/**
 * Returns the N most recent transactions.
 */
export async function getRecentTransactions(limit = 10) {
  return FinancialRecord.find({})
    .sort({ date: -1 })
    .limit(limit)
    .lean()
}

/**
 * Returns monthly income vs expenses for a given year.
 */
export async function getMonthlyTrends(year: number) {
  const start = new Date(`${year}-01-01`)
  const end = new Date(`${year + 1}-01-01`)

  return FinancialRecord.aggregate([
    {
      $match: { date: { $gte: start, $lt: end } },
    },
    {
      $group: {
        _id: {
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        type: '$_id.type',
        total: 1,
      },
    },
    { $sort: { month: 1 } },
  ])
}
