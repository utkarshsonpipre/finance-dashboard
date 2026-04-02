import { User } from '@/models/User'
import { z } from 'zod'

export const UpdateUserSchema = z.object({
  role: z.enum(['viewer', 'analyst', 'admin']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
}).refine(data => data.role || data.status, {
  message: 'At least one field (role or status) must be provided for update',
})

export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>

export const SelectRoleSchema = z.object({
  role: z.enum(['viewer', 'analyst', 'admin']),
})

export async function updateMyRole(clerkId: string, role: string) {
  let user = await User.findOne({ clerkId })
  
  if (!user) {
    // Webhook failed or hasn't raced yet (common in localhost without ngrok).
    // Gracefully fallback to fetching user details directly from Clerk API to proactively seed the DB!
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` }
    })
    
    if (!clerkRes.ok) {
      throw new Error('Account sync failed. Failed to reach Clerk API.')
    }
    
    const clerkUser = await clerkRes.json()
    const email = clerkUser.email_addresses?.[0]?.email_address || ''
    const name = [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(' ') || 'User'
    
    user = new User({
      clerkId,
      email,
      name,
      role: role as any,
      roleSelected: true
    })
    
    await user.save()
    return user
  }
  
  user.role = role as any
  user.roleSelected = true
  await user.save()
  return user
}

export async function getUsers() {
  return await User.find().sort({ createdAt: -1 })
}

export async function updateUser(id: string, data: UpdateUserDTO) {
  const user = await User.findById(id)
  if (!user) {
    throw new Error('User not found')
  }

  if (data.role) user.role = data.role
  if (data.status) user.status = data.status

  await user.save()
  return user
}
