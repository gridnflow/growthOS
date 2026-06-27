import { runReflectionAgent } from '@/modules/ai-agents/reflection'
import { runContentCreatorAgent } from '@/modules/ai-agents/contentCreator'
import { runReelsGeneratorAgent } from '@/modules/ai-agents/reelsGenerator'
import * as sessionRepository from './repository'
import * as goalRepository from '@/modules/goals/repository'
import * as analyticsService from '@/modules/analytics/service'
import type { ActivityEntry } from '@/modules/ai-agents/types'
import type {
  StartSessionInput,
  EndSessionInput,
  RecentSessions,
  SessionListItem,
  SessionDetail,
} from './types'

export async function startSession(input: StartSessionInput) {
  return sessionRepository.createSession(input)
}

export async function endSession(input: EndSessionInput) {
  const session = await sessionRepository.endSession(input)
  const goal = await goalRepository.findGoalById(session.goalId)
  if (!goal) return session

  const topApps = input.activityLog
    .sort((a, b) => b.durationSec - a.durationSec)
    .slice(0, 3)
    .map((a) => a.app)

  const aggregates = await analyticsService.getSessionAggregates({
    userId: session.userId,
    goalId: session.goalId,
    sessionDate: session.startedAt,
  })
  const totalHoursThisWeek = await analyticsService.getWeeklyFocusedHours(session.userId)

  // Run AI pipeline — each step is independent; a failure doesn't abort the rest
  let reflection = null
  try {
    const reflectionOutput = await runReflectionAgent({
      durationSeconds: input.durationSec,
      tasksCompleted: aggregates.tasksCompleted,
      tasksSkipped: aggregates.tasksSkipped,
      appsUsed: input.activityLog,
      goalContext: goal.title,
    })
    reflection = await sessionRepository.saveReflection(session.id, reflectionOutput)

    try {
      const contentOutput = await runContentCreatorAgent({
        reflection: reflectionOutput,
        goalTitle: goal.title,
        streakCount: aggregates.streakCount,
        totalHoursThisWeek,
        progressPercentage: aggregates.progressPercentage,
      })
      await sessionRepository.saveLinkedInPost(session.id, contentOutput)
    } catch {
      // Content creation failure is non-critical
    }

    try {
      const reelsOutput = await runReelsGeneratorAgent({
        sessionStats: {
          durationSeconds: input.durationSec,
          tasksCompleted: aggregates.tasksCompleted,
          topApps,
          streakCount: aggregates.streakCount,
        },
        reflection: {
          keyInsight: reflectionOutput.keyInsight,
          focusScore: reflectionOutput.focusScore,
        },
        goalTitle: goal.title,
      })
      await sessionRepository.saveReel(session.id, reelsOutput)
    } catch {
      // Reels generation failure is non-critical
    }
  } catch {
    // Reflection failure is logged but doesn't fail the session
  }

  return { session, reflection }
}

export async function getSession(sessionId: string) {
  return sessionRepository.findSessionById(sessionId)
}

export async function getSessionDetail(
  sessionId: string,
  userId: string
): Promise<SessionDetail | null> {
  const s = await sessionRepository.findSessionById(sessionId)
  if (!s || s.userId !== userId) return null

  return {
    id: s.id,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    durationSec: s.durationSec,
    goalTitle: s.goal.title,
    activityLog: (s.activityLog as ActivityEntry[] | null) ?? [],
    reflection: s.reflection
      ? {
          accomplishments: s.reflection.accomplishments,
          distractions: s.reflection.distractions,
          focusScore: s.reflection.focusScore,
          keyInsight: s.reflection.keyInsight,
          nextStep: s.reflection.nextStep,
          encouragement: s.reflection.encouragement,
        }
      : null,
    linkedInPost: s.linkedInPost
      ? {
          hook: s.linkedInPost.hook,
          body: s.linkedInPost.body,
          cta: s.linkedInPost.cta,
          hashtags: s.linkedInPost.hashtags,
          fullPost: s.linkedInPost.fullPost,
        }
      : null,
    reel: s.reel
      ? {
          narrationScript: s.reel.narrationScript,
          hookText: s.reel.hookText,
          ctaText: s.reel.ctaText,
          musicMood: s.reel.musicMood,
          estimatedDurationSec: s.reel.estimatedDurationSec,
        }
      : null,
  }
}

export async function getRecentSessions(userId: string): Promise<RecentSessions> {
  const rows = await sessionRepository.findRecentSessionsByUser(userId)

  const sessions: SessionListItem[] = rows.map((row) => ({
    id: row.id,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
    durationSec: row.durationSec,
    goal: { title: row.goal.title },
    hasReflection: row.reflection !== null,
    focusScore: row.reflection?.focusScore ?? null,
    hasPost: row.linkedInPost !== null,
    hasReel: row.reel !== null,
  }))

  return {
    sessions,
    summary: {
      totalSessions: sessions.length,
      totalFocusSec: sessions.reduce((sum, s) => sum + (s.durationSec ?? 0), 0),
    },
  }
}
