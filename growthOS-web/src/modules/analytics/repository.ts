import { prisma } from '@/lib/prisma'

function dayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
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
