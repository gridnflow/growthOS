import { prisma } from '@/lib/prisma'
import type { CreateGoalInput } from './types'

export async function createGoal(input: CreateGoalInput) {
  return prisma.goal.create({
    data: {
      userId: input.userId,
      title: input.title,
      deadline: input.deadline,
      dailyHours: input.dailyHours,
    },
  })
}

export async function findGoalsByUserId(userId: string) {
  return prisma.goal.findMany({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  })
}

// All goals regardless of status — the Goals page shows ACTIVE/PAUSED/COMPLETED
// with a status badge, unlike the dashboard which only surfaces active goals.
export async function findAllGoalsByUserId(userId: string) {
  return prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findGoalById(id: string) {
  return prisma.goal.findUnique({ where: { id } })
}

export async function createPlan(data: {
  goalId: string
  type: 'MONTHLY' | 'WEEKLY' | 'DAILY'
  month?: number
  weekNumber?: number
  content: object
}) {
  return prisma.plan.create({ data })
}

export async function createTasks(
  tasks: Array<{
    planId: string
    title: string
    date: Date
    estimatedMin: number
  }>
) {
  return prisma.task.createMany({ data: tasks })
}

export async function findTodayTasks(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return prisma.task.findMany({
    where: {
      date: { gte: today, lt: tomorrow },
      plan: { goal: { userId, status: 'ACTIVE' } },
    },
    include: { plan: { include: { goal: true } } },
  })
}
