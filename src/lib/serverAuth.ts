import { auth } from '@clerk/nextjs/server'
import { connectDB } from '@/utils/db'
import { User } from '@/models/User'

export async function requireUser() {
  await connectDB()
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  
  const user = await User.findOne({ clerkId: userId })
  if (!user) {
    throw new Error('User not found')
  }
  return user
}

export function authorizeRole(userRole: string, allowedRoles: string[]) {
  if (!allowedRoles.includes(userRole)) {
    throw new Error('Forbidden')
  }
}
