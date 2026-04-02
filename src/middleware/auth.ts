// src/middleware/auth.ts
// Clerk authentication and role-based authorization middleware

import type { Request, Response, NextFunction } from 'express'
import { ClerkExpressRequireAuth, StrictAuthProp } from '@clerk/clerk-sdk-node'
import { User } from '@/models/User'
import { sendError } from '@/utils/response'
import type { Role } from '@/types'

// Add StrictAuthProp to the Request type for Clerk
declare global {
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

/**
 * verifyJWT — delegates to Clerk's RequireAuth middleware.
 * It strictly enforces that a valid Clerk JWT is present.
 */
export const verifyJWT = ClerkExpressRequireAuth()

/**
 * authorizeRoles — factory that returns middleware allowing only
 * the specified roles to proceed. It looks up the user's role in MongoDB
 * based on their Clerk ID.
 */
export function authorizeRoles(...roles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth || !req.auth.userId) {
        sendError(res, 'Not authenticated', 401)
        return
      }

      // Look up the user in our DB by their Clerk ID
      const user = await User.findOne({ clerkId: req.auth.userId }).select('role status')

      if (!user) {
        sendError(res, 'User profile not found in database', 403)
        return
      }

      if (user.status === 'inactive') {
        sendError(res, 'Account is inactive', 403)
        return
      }

      // Attach userRole to req for potential down-stream usage
      req.userRole = user.role

      if (!roles.includes(user.role)) {
        sendError(res, `Access denied. Required roles: ${roles.join(', ')}`, 403)
        return
      }

      next()
    } catch (err) {
      sendError(res, 'Authorization error', 500)
    }
  }
}
