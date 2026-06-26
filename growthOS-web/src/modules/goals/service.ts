import { runGoalPlannerAgent } from '@/modules/ai-agents/goalPlanner'
import { runTaskBreakdownAgent } from '@/modules/ai-agents/taskBreakdown'
import * as goalRepository from './repository'
import type { CreateGoalInput } from './types'

export async function createGoal(input: CreateGoalInput) {
  const goal = await goalRepository.createGoal(input)

  const plannerOutput = await runGoalPlannerAgent({
    goal: input.title,
    deadline: input.deadline,
    dailyHours: input.dailyHours,
    currentLevel: input.currentLevel,
  })

  const monthlyPlan = await goalRepository.createPlan({
    goalId: goal.id,
    type: 'MONTHLY',
    content: plannerOutput,
  })

  const firstMilestone = plannerOutput.monthlyMilestones[0]
  if (firstMilestone) {
    const breakdownOutput = await runTaskBreakdownAgent({
      monthlyMilestone: firstMilestone,
      weekNumber: 1,
      completedTasks: [],
      dailyHours: input.dailyHours,
    })

    const weeklyPlan = await goalRepository.createPlan({
      goalId: goal.id,
      type: 'WEEKLY',
      weekNumber: 1,
      month: 1,
      content: breakdownOutput,
    })

    const tasks = breakdownOutput.dayPlans.flatMap((day) =>
      day.tasks.map((task) => ({
        planId: weeklyPlan.id,
        title: task.title,
        date: new Date(day.date),
        estimatedMin: task.estimatedMinutes,
      }))
    )

    await goalRepository.createTasks(tasks)
  }

  return { goal, monthlyPlan }
}

export async function getGoals(userId: string) {
  return goalRepository.findGoalsByUserId(userId)
}

export async function getTodayTasks(userId: string) {
  return goalRepository.findTodayTasks(userId)
}
