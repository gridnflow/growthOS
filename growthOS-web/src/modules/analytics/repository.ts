import { prisma } from '@/lib/prisma'

function dayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

// Monday-anchored week, matching the project's weekly-plan cadence.
function weekBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const dayOfWeek = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - dayOfWeek)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return { start, end }
}

async function sumSessionDurationBetween(
  userId: string,
  start: Date,
  end: Date
): Promise<number> {
  const result = await prisma.session.aggregate({
    where: { userId, startedAt: { gte: start, lt: end } },
    _sum: { durationSec: true },
  })
  return result._sum.durationSec ?? 0
}

export async function findGoalTasksByDay(
  goalId: string,
  date: Date
): Promise<Array<{ title: string; status: string }>> {
  const { start, end } = dayBounds(date)
  return prisma.task.findMany({
    where: {
      date: { gte: start, lt: end },
      plan: { goalId },
    },
    select: { title: true, status: true },
  })
}

export async function countGoalTasksByStatus(
  goalId: string
): Promise<{ done: number; total: number }> {
  const [done, total] = await Promise.all([
    prisma.task.count({ where: { plan: { goalId }, status: 'DONE' } }),
    prisma.task.count({ where: { plan: { goalId } } }),
  ])
  return { done, total }
}

export async function findSessionStartDates(userId: string): Promise<Date[]> {
  const sessions = await prisma.session.findMany({
    where: { userId },
    select: { startedAt: true },
  })
  return sessions.map((s) => s.startedAt)
}

export async function sumFocusedSecToday(userId: string, now: Date): Promise<number> {
  const { start, end } = dayBounds(now)
  return sumSessionDurationBetween(userId, start, end)
}

export async function sumFocusedSecThisWeek(userId: string, now: Date): Promise<number> {
  const { start, end } = weekBounds(now)
  return sumSessionDurationBetween(userId, start, end)
}

export async function countActiveGoals(userId: string): Promise<number> {
  return prisma.goal.count({ where: { userId, status: 'ACTIVE' } })
}

export async function countUserTasksByStatus(
  userId: string
): Promise<{ done: number; total: number }> {
  const activeGoalScope = { plan: { goal: { userId, status: 'ACTIVE' as const } } }
  const [done, total] = await Promise.all([
    prisma.task.count({ where: { ...activeGoalScope, status: 'DONE' } }),
    prisma.task.count({ where: activeGoalScope }),
  ])
  return { done, total }
}
