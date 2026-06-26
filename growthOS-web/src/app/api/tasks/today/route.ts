import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import * as goalService from '@/modules/goals/service'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tasks = await goalService.getTodayTasks(userId)
  return NextResponse.json(tasks)
}
