import { NextResponse } from 'next/server'
import { requireUser, authorizeRole } from '@/lib/serverAuth'
import { RecordQuerySchema, CreateRecordSchema, getRecords, createRecord } from '@/services/recordService'

export async function GET(req: Request) {
  try {
    const user = await requireUser()
    authorizeRole(user.role, ['viewer', 'analyst', 'admin'])
    
    const { searchParams } = new URL(req.url)
    const query = Object.fromEntries(searchParams.entries())
    const queryData = RecordQuerySchema.parse(query)
    
    const records = await getRecords(queryData)
    return NextResponse.json({ success: true, data: records })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser()
    authorizeRole(user.role, ['admin'])
    
    const body = await req.json()
    const data = CreateRecordSchema.parse(body)
    
    const record = await createRecord(data)
    return NextResponse.json({ success: true, message: 'Record created', data: record })
  } catch (err: any) {
    if (err.issues) return NextResponse.json({ success: false, message: err.issues[0].message }, { status: 400 })
    return NextResponse.json({ success: false, message: err.message }, { status: 400 })
  }
}
