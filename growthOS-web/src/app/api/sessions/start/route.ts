import { NextRequest, NextResponse } from 'next/server'
import * as sessionService from '@/modules/sessions/service'
import { getCurrentUserId } from '@/lib/currentUser'

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'No user configured' }, { status: 500 })

  const body = await req.json() as { goalId: string; startedAt?: string }

  const session = await sessionService.startSession({
    userId,
    goalId: body.goalId,
    startedAt: body.startedAt ? new Date(body.startedAt) : new Date(),
  })

  return NextResponse.json({ sessionId: session.id }, { status: 201 })
}
