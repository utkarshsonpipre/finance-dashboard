import { NextResponse } from 'next/server'
import { requireUser, authorizeRole } from '@/lib/serverAuth'
import { UpdateRecordSchema, updateRecord, deleteRecord } from '@/services/recordService'

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    authorizeRole(user.role, ['admin'])
    const params = await props.params
    const id = params.id
    
    const body = await req.json()
    const data = UpdateRecordSchema.parse(body)
    
    const record = await updateRecord(id, data)
    return NextResponse.json({ success: true, message: 'Record updated', data: record })
  } catch (err: any) {
    if (err.issues) return NextResponse.json({ success: false, message: err.issues[0].message }, { status: 400 })
    return NextResponse.json({ success: false, message: err.message }, { status: 400 })
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    authorizeRole(user.role, ['admin'])
    const params = await props.params
    const id = params.id
    
    await deleteRecord(id)
    return NextResponse.json({ success: true, message: 'Record deleted' })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 })
  }
}
