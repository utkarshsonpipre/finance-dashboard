import type { Request, Response } from 'express'
import { User } from '@/models/User'
import { getUsers, updateUser, UpdateUserSchema, updateMyRole as updateMyRoleService, SelectRoleSchema } from '@/services/userService'
import { sendSuccess, sendError } from '@/utils/response'
import { ZodError } from 'zod'

export async function updateMyRole(req: Request, res: Response): Promise<void> {
  try {
    const data = SelectRoleSchema.parse(req.body)
    const clerkId = req.auth?.userId
    if (!clerkId) {
      sendError(res, 'Not authenticated', 401)
      return
    }
    
    const user = await updateMyRoleService(clerkId, data.role)
    sendSuccess(res, user, 'Role updated successfully')
  } catch (err: any) {
    if (err instanceof ZodError) {
      sendError(res, err.issues.map((e: any) => e.message).join('; '), 400)
      return
    }
    sendError(res, err.message, 400)
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findOne({ clerkId: req.auth?.userId })
    if (!user) {
      sendError(res, 'User not found in database', 404)
      return
    }

    sendSuccess(res, {
      id: user.id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      roleSelected: user.roleSelected,
    })
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export async function getAll(_req: Request, res: Response): Promise<void> {
  try {
    const users = await getUsers()
    sendSuccess(res, users, 'Users retrieved')
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const data = UpdateUserSchema.parse(req.body)
    const user = await updateUser(req.params.id as string, data)
    sendSuccess(res, user, 'User updated')
  } catch (err: any) {
    if (err instanceof ZodError) {
      sendError(res, err.issues.map((e: any) => e.message).join('; '), 400)
      return
    }
    const status = err.message === 'User not found' ? 404 : 400
    sendError(res, err.message, status)
  }
}
