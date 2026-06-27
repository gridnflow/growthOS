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

export type SessionDetail = {
  id: string
  startedAt: Date
  endedAt: Date | null
  durationSec: number | null
  goalTitle: string
  activityLog: ActivityEntry[]
  reflection: {
    accomplishments: string[]
    distractions: string[]
    focusScore: number
    keyInsight: string
    nextStep: string
    encouragement: string
  } | null
  linkedInPost: {
    hook: string
    body: string
    cta: string
    hashtags: string[]
    fullPost: string
  } | null
  reel: {
    narrationScript: string
    hookText: string
    ctaText: string
    musicMood: string
    estimatedDurationSec: number
  } | null
}
