import { NextRequest, NextResponse } from 'next/server'
import * as sessionService from '@/modules/sessions/service'
import type { ActivityEntry } from '@/modules/ai-agents/types'
import { getCurrentUserId } from '@/lib/currentUser'

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'No user configured' }, { status: 500 })

  const body = await req.json() as {
    sessionId: string
    durationSec: number
    activityLog: ActivityEntry[]
    videoLocalPath?: string
  }

  const result = await sessionService.endSession({
    sessionId: body.sessionId,
    userId,
    durationSec: body.durationSec,
    activityLog: body.activityLog,
    videoLocalPath: body.videoLocalPath,
  })

  return NextResponse.json(result)
}
