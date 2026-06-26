import { openai, MODEL } from '@/lib/openai'
import type { TaskBreakdownInput, TaskBreakdownOutput } from './types'

const SYSTEM_PROMPT = `You are a productivity coach breaking down weekly goals into daily tasks.

Rules:
- Maximum 3 tasks per day
- Each task must be completable in under 45 minutes
- If previous completion rate was low, reduce task count and difficulty
- Provide specific resources (links, tools, docs) where helpful
- weeklyTheme should be one sentence describing the week's focus
- Respond ONLY with valid JSON matching the output schema`

export async function runTaskBreakdownAgent(
  input: TaskBreakdownInput
): Promise<TaskBreakdownOutput> {
  const completionRate =
    input.completedTasks.length > 0
      ? Math.round((input.completedTasks.length / (input.completedTasks.length + 3)) * 100)
      : 100

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: JSON.stringify({
          milestone: input.monthlyMilestone,
          weekNumber: input.weekNumber,
          previousWeekCompletionRate: `${completionRate}%`,
          completedLastWeek: input.completedTasks,
          dailyHoursAvailable: input.dailyHours,
          daysInWeek: 7,
        }),
      },
    ],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(completion.choices[0].message.content!) as TaskBreakdownOutput
}
