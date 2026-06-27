import { getOpenAI, MODEL } from '@/lib/openai'
import type { ContentCreatorInput, ContentCreatorOutput } from './types'

const SYSTEM_PROMPT = `You are a "Build in Public" LinkedIn ghostwriter.

Rules:
- hook: scroll-stopping first line — use a number, question, or bold statement
- body: a single string of 3-5 bullet points (one per line, separated by \n; each line starting with "- ") with specific achievements and honest observations
- cta: end with a genuine question or invitation to connect
- hashtags: 5-7 relevant hashtags (include #buildinpublic #100daysof...)
- fullPost: complete formatted post combining all parts
- Tone: authentic, specific, not corporate — like a real person sharing progress
- Include concrete numbers (Day X, N hours, N% complete)

Respond ONLY with a valid JSON object containing ALL of these keys (none may be omitted):
{
  "hook": string,        // the scroll-stopping first line, as its own field
  "body": string,        // bullet points joined by \\n, NOT included in hook/cta
  "cta": string,
  "hashtags": string[],
  "fullPost": string     // hook + body + cta + hashtags combined into one post
}`

export async function runContentCreatorAgent(
  input: ContentCreatorInput
): Promise<ContentCreatorOutput> {
  const completion = await getOpenAI().chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: JSON.stringify({
          goal: input.goalTitle,
          streakDay: input.streakCount,
          hoursThisWeek: input.totalHoursThisWeek,
          progressPercent: input.progressPercentage,
          accomplishments: input.reflection.accomplishments,
          keyInsight: input.reflection.keyInsight,
          focusScore: input.reflection.focusScore,
          distractions: input.reflection.distractions,
        }),
      },
    ],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(completion.choices[0].message.content!) as ContentCreatorOutput
}
