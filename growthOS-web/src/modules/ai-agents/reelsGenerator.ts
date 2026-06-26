import { openai, MODEL } from '@/lib/openai'
import type { ReelsGeneratorInput, ReelsGeneratorOutput } from './types'

const SYSTEM_PROMPT = `You are an Instagram Reels scriptwriter for productivity content.

Rules:
- Target duration: 15-30 seconds
- hookText: first 3 seconds — must stop the scroll (bold claim or shocking stat)
- narrationScript: natural spoken language, energetic but genuine
- overlaySequence: 4-6 text overlays timed throughout the video
  - timestampSec: when to show (0, 3, 8, 13, 18, 23...)
  - style: "title" for big statements, "stat" for numbers, "caption" for details
- ctaText: final overlay — follow/save/comment CTA
- musicMood: based on session energy and focus score
- estimatedDurationSec: realistic total reel length
- Respond ONLY with valid JSON matching the output schema`

export async function runReelsGeneratorAgent(
  input: ReelsGeneratorInput
): Promise<ReelsGeneratorOutput> {
  const durationMin = Math.round(input.sessionStats.durationSeconds / 60)

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: JSON.stringify({
          goal: input.goalTitle,
          sessionMinutes: durationMin,
          streakDay: input.sessionStats.streakCount,
          tasksCompleted: input.sessionStats.tasksCompleted,
          topApps: input.sessionStats.topApps,
          keyInsight: input.reflection.keyInsight,
          focusScore: input.reflection.focusScore,
        }),
      },
    ],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(completion.choices[0].message.content!) as ReelsGeneratorOutput
}
