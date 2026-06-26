import { NextRequest, NextResponse } from 'next/server'
import * as sessionService from '@/modules/sessions/service'
import { getUserId } from '@/lib/clerk'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const session = await sessionService.getSession(id)

  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(session)
}
