import { NextRequest, NextResponse } from 'next/server'
import * as sessionService from '@/modules/sessions/service'
import type { ActivityEntry } from '@/modules/ai-agents/types'
import { getUserId } from '@/lib/clerk'

export async function POST(req: NextRequest) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
