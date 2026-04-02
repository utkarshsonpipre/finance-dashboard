import { Router } from 'express'
import { verifyJWT, authorizeRoles } from '@/middleware/auth'
import { getMe, getAll, update, updateMyRole } from '@/controllers/userController'

const router = Router()

// All routes require authentication
router.use((req, res, next) => {
  verifyJWT(req as any, res as any, next)
})

// GET /api/users/me — Accessible by any authenticated user
router.get('/me', getMe)

// PATCH /api/users/me/role — Accessible by any authenticated user
router.patch('/me/role', updateMyRole)

// GET /api/users — Admin only
router.get('/', authorizeRoles('admin'), getAll)

// PATCH /api/users/:id — Admin only
router.patch('/:id', authorizeRoles('admin'), update)

export default router
