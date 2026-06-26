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

export type SessionListItem = {
  id: string
  startedAt: Date
  endedAt: Date | null
  durationSec: number | null
  goal: { title: string }
  hasReflection: boolean
  focusScore: number | null
  hasPost: boolean
  hasReel: boolean
}

export type RecentSessions = {
  sessions: SessionListItem[]
  summary: { totalSessions: number; totalFocusSec: number }
}
