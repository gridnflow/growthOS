import { NextRequest, NextResponse } from 'next/server'
import * as goalService from '@/modules/goals/service'
import { getCurrentUserId } from '@/lib/currentUser'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'No user configured' }, { status: 500 })

  const { id } = await params
  const body = (await req.json()) as { status?: string }
  if (!body.status || !goalService.isTaskStatus(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updated = await goalService.setTaskStatus(id, userId, body.status)
  if (!updated) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
