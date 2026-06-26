import { NextResponse } from 'next/server'
import * as goalService from '@/modules/goals/service'
import { getCurrentUserId } from '@/lib/currentUser'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'No user configured' }, { status: 500 })

  const tasks = await goalService.getTodayTasks(userId)
  return NextResponse.json(tasks)
}
