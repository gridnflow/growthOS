import { NextResponse } from 'next/server'
import * as sessionService from '@/modules/sessions/service'
import { getCurrentUserId } from '@/lib/currentUser'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'No user configured' }, { status: 500 })

  const { id } = await params
  const session = await sessionService.getSession(id)

  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(session)
}
