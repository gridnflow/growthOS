import { NextRequest, NextResponse } from 'next/server'
import * as goalService from '@/modules/goals/service'
import { getCurrentUserId } from '@/lib/currentUser'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'No user configured' }, { status: 500 })

  const goals = await goalService.getGoals(userId)
  return NextResponse.json(goals)
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'No user configured' }, { status: 500 })

  const body = await req.json() as {
    title: string
    deadline: string
    dailyHours: number
    currentLevel?: string
  }

  const result = await goalService.createGoal({
    userId,
    title: body.title,
    deadline: new Date(body.deadline),
    dailyHours: body.dailyHours,
    currentLevel: body.currentLevel,
  })

  return NextResponse.json(result, { status: 201 })
}
