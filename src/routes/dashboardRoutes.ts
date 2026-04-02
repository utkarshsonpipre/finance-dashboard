// src/routes/dashboardRoutes.ts
// Dashboard analytics endpoints

import { Router } from 'express'
import {
  summary,
  categoryTotals,
  recentTransactions,
  monthlyTrends,
} from '@/controllers/dashboardController'
import { verifyJWT, authorizeRoles } from '@/middleware/auth'

const router = Router()

router.use((req, res, next) => {
  verifyJWT(req as any, res as any, next)
})

// GET /api/dashboard/summary — all authenticated roles
router.get('/summary', authorizeRoles('viewer', 'analyst', 'admin'), summary)

// GET /api/dashboard/recent-transactions — all authenticated roles
router.get('/recent-transactions', authorizeRoles('viewer', 'analyst', 'admin'), recentTransactions)

// GET /api/dashboard/category-totals — Analyst and Admin only
router.get('/category-totals', authorizeRoles('analyst', 'admin'), categoryTotals)

// GET /api/dashboard/monthly-trends — Analyst and Admin only
router.get('/monthly-trends', authorizeRoles('analyst', 'admin'), monthlyTrends)

export default router
