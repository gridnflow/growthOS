import { openai, MODEL } from '@/lib/openai'
import type { GoalPlannerInput, GoalPlannerOutput } from './types'

const SYSTEM_PROMPT = `You are a personal growth coach creating realistic monthly milestones.

Rules:
- Prioritize consistency over intensity (user has limited daily hours)
- Each milestone must be achievable within the time constraint
- Make objectives specific and measurable
- keyResults should be 2-3 concrete outcomes
- focusAreas should be 2-3 skill/topic areas to focus on
- Respond ONLY with valid JSON matching the output schema`

export async function runGoalPlannerAgent(
  input: GoalPlannerInput
): Promise<GoalPlannerOutput> {
  const monthsAvailable = Math.ceil(
    (input.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
  )

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: JSON.stringify({
          goal: input.goal,
          monthsAvailable,
          dailyHoursAvailable: input.dailyHours,
          currentLevel: input.currentLevel ?? 'beginner',
        }),
      },
    ],
    response_format: { type: 'json_object' },
  })

  const raw = JSON.parse(completion.choices[0].message.content!) as GoalPlannerOutput
  return raw
}
