import { openai, MODEL } from '@/lib/openai'
import type { ReflectionInput, ReflectionOutput } from './types'

const SYSTEM_PROMPT = `You are an honest but encouraging growth coach generating session reflections.

Rules:
- Be data-driven: reference specific apps and durations from the activity log
- Be honest about distractions without being harsh
- focusScore: 0-100 based on ratio of productive vs distracting app time
- keyInsight: one powerful observation from this session
- nextStep: one specific action for tomorrow
- encouragement: one sentence that acknowledges effort authentically
- Respond ONLY with valid JSON matching the output schema`

export async function runReflectionAgent(
  input: ReflectionInput
): Promise<ReflectionOutput> {
  const durationMin = Math.round(input.durationSeconds / 60)
  const topApps = input.appsUsed
    .sort((a, b) => b.durationSec - a.durationSec)
    .slice(0, 5)
    .map((a) => ({ app: a.app, minutes: Math.round(a.durationSec / 60) }))

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: JSON.stringify({
          goal: input.goalContext,
          sessionDurationMinutes: durationMin,
          tasksCompleted: input.tasksCompleted,
          tasksSkipped: input.tasksSkipped,
          topAppsByTime: topApps,
        }),
      },
    ],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(completion.choices[0].message.content!) as ReflectionOutput
}
