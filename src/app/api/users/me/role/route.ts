import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectDB } from '@/utils/db'
import { SelectRoleSchema, updateMyRole } from '@/services/userService'

export async function PATCH(req: Request) {
  try {
    await connectDB()
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const data = SelectRoleSchema.parse(body)

    const user = await updateMyRole(userId, data.role)
    return NextResponse.json({ success: true, message: 'Role updated successfully', data: user })
  } catch (error: any) {
    if (error.issues) return NextResponse.json({ success: false, message: error.issues[0].message }, { status: 400 })
    return NextResponse.json({ success: false, message: error.message }, { status: 400 })
  }
}
