import type { ActivityEntry } from '@/modules/ai-agents/types'

export type StartSessionInput = {
  userId: string
  goalId: string
  startedAt: Date
}

export type EndSessionInput = {
  sessionId: string
  userId: string
  durationSec: number
  activityLog: ActivityEntry[]
  videoLocalPath?: string
}

export type SessionResult = {
  sessionId: string
  reflection: object | null
  linkedInPost: object | null
  reel: object | null
}
