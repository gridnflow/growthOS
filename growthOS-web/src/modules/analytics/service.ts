import * as analyticsRepository from './repository'
import type {
  SessionAggregates,
  SessionAggregatesInput,
  SessionTaskBreakdown,
} from './types'

function toDayKey(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

async function computeTaskBreakdown(
  goalId: string,
  sessionDate: Date
): Promise<SessionTaskBreakdown> {
  const tasks = await analyticsRepository.findGoalTasksByDay(goalId, sessionDate)
  return {
    tasksCompleted: tasks.filter((t) => t.status === 'DONE').map((t) => t.title),
    tasksSkipped: tasks.filter((t) => t.status === 'SKIPPED').map((t) => t.title),
  }
}

async function computeStreak(userId: string, sessionDate: Date): Promise<number> {
  const dates = await analyticsRepository.findSessionStartDates(userId)
  const dayKeys = new Set(dates.map(toDayKey))

  let streak = 0
  const cursor = new Date(sessionDate)
  cursor.setHours(0, 0, 0, 0)

  while (dayKeys.has(toDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

async function computeProgress(goalId: string): Promise<number> {
  const { done, total } = await analyticsRepository.countGoalTasksByStatus(goalId)
  if (total === 0) return 0
  return Math.round((done / total) * 100)
}

export async function getSessionAggregates(
  input: SessionAggregatesInput
): Promise<SessionAggregates> {
  const [breakdown, streakCount, progressPercentage] = await Promise.all([
    computeTaskBreakdown(input.goalId, input.sessionDate),
    computeStreak(input.userId, input.sessionDate),
    computeProgress(input.goalId),
  ])

  return { ...breakdown, streakCount, progressPercentage }
}
