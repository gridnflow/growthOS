import { NextRequest, NextResponse } from 'next/server'
import * as goalService from '@/modules/goals/service'
import { getUserId } from '@/lib/clerk'

export async function GET(req: NextRequest) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tasks = await goalService.getTodayTasks(userId)
  return NextResponse.json(tasks)
}
