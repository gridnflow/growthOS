import { NextRequest, NextResponse } from 'next/server'
import * as goalService from '@/modules/goals/service'
import { getUserId } from '@/lib/clerk'

export async function GET(req: NextRequest) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const goals = await goalService.getGoals(userId)
  return NextResponse.json(goals)
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
