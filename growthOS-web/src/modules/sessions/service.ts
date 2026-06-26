import { runReflectionAgent } from '@/modules/ai-agents/reflection'
import { runContentCreatorAgent } from '@/modules/ai-agents/contentCreator'
import { runReelsGeneratorAgent } from '@/modules/ai-agents/reelsGenerator'
import * as sessionRepository from './repository'
import * as goalRepository from '@/modules/goals/repository'
import * as analyticsService from '@/modules/analytics/service'
import type { StartSessionInput, EndSessionInput } from './types'

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
        totalHoursThisWeek: Math.round(input.durationSec / 3600),
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
