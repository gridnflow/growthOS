import { NextRequest, NextResponse } from 'next/server'
import * as sessionService from '@/modules/sessions/service'
import { getUserId } from '@/lib/clerk'

export async function POST(req: NextRequest) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { goalId: string; startedAt?: string }

  const session = await sessionService.startSession({
    userId,
    goalId: body.goalId,
    startedAt: body.startedAt ? new Date(body.startedAt) : new Date(),
  })

  return NextResponse.json({ sessionId: session.id }, { status: 201 })
}
