import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/serverAuth'

export async function GET() {
  try {
    const user = await requireUser()
    return NextResponse.json({
      success: true,
      data: {
        id: user.id, clerkId: user.clerkId, name: user.name,
        email: user.email, role: user.role, status: user.status,
        roleSelected: user.roleSelected,
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.message === 'Unauthorized' ? 401 : 404 })
  }
}
