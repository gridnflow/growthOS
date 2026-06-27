import OpenAI from 'openai'

const globalForOpenAI = globalThis as unknown as { openai?: OpenAI }

export function getOpenAI(): OpenAI {
  if (globalForOpenAI.openai) return globalForOpenAI.openai

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  if (process.env.NODE_ENV !== 'production') globalForOpenAI.openai = client

  return client
}

export const MODEL = 'gpt-4.1' as const
