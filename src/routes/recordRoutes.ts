// src/routes/recordRoutes.ts
// Financial record CRUD endpoints with role-based access

import { Router } from 'express'
import { create, getAll, update, remove } from '@/controllers/recordController'
import { verifyJWT, authorizeRoles } from '@/middleware/auth'
import { validate } from '@/middleware/validate'
import { CreateRecordSchema } from '@/services/recordService'

const router = Router()

// All routes require authentication
router.use((req, res, next) => {
  verifyJWT(req as any, res as any, next)
})

// GET /api/records — accessible by Analyst and Admin
router.get('/', authorizeRoles('analyst', 'admin'), getAll)

// POST /api/records — Admin only
router.post('/', authorizeRoles('admin'), validate(CreateRecordSchema), create)

// PATCH /api/records/:id — Admin only
router.patch('/:id', authorizeRoles('admin'), update)

// DELETE /api/records/:id — Admin only
router.delete('/:id', authorizeRoles('admin'), remove)

export default router
