import { getOpenAI, MODEL } from '@/lib/openai'
import type { TaskBreakdownInput, TaskBreakdownOutput } from './types'

const SYSTEM_PROMPT = `You are a productivity coach breaking down weekly goals into daily tasks.

Rules:
- Maximum 3 tasks per day
- Each task must be completable in under 45 minutes
- If previous completion rate was low, reduce task count and difficulty
- Provide specific resources (links, tools, docs) where helpful
- weeklyTheme should be one sentence describing the week's focus
- Generate exactly 7 day plans; "date" must be an ISO date string (YYYY-MM-DD),
  starting from the provided startDate and incrementing by one day

Respond ONLY with valid JSON in exactly this shape (no extra keys, no wrapping):
{
  "weeklyTheme": "string",
  "dayPlans": [
    {
      "date": "YYYY-MM-DD",
      "tasks": [
        { "title": "string", "estimatedMinutes": 30, "resources": ["string"] }
      ]
    }
  ]
}`

export async function runTaskBreakdownAgent(
  input: TaskBreakdownInput
): Promise<TaskBreakdownOutput> {
  const completionRate =
    input.completedTasks.length > 0
      ? Math.round((input.completedTasks.length / (input.completedTasks.length + 3)) * 100)
      : 100

  const completion = await getOpenAI().chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: JSON.stringify({
          milestone: input.monthlyMilestone,
          weekNumber: input.weekNumber,
          // The model has no clock; pass today so day plans start from the real date.
          startDate: new Date().toISOString().slice(0, 10),
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
