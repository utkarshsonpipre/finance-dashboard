import { NextResponse } from 'next/server'
import { requireUser, authorizeRole } from '@/lib/serverAuth'
import { getSummary } from '@/services/dashboardService'

export async function GET() {
  try {
    const user = await requireUser()
    authorizeRole(user.role, ['viewer', 'analyst', 'admin'])
    
    const summary = await getSummary()
    return NextResponse.json({ success: true, data: summary })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 })
  }
}
