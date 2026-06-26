import { prisma } from '@/lib/prisma'
import type { StartSessionInput, EndSessionInput } from './types'
import type {
  ReflectionOutput,
  ContentCreatorOutput,
  ReelsGeneratorOutput,
} from '@/modules/ai-agents/types'

export async function createSession(input: StartSessionInput) {
  return prisma.session.create({
    data: {
      userId: input.userId,
      goalId: input.goalId,
      startedAt: input.startedAt,
    },
  })
}

export async function endSession(input: EndSessionInput) {
  return prisma.session.update({
    where: { id: input.sessionId },
    data: {
      endedAt: new Date(),
      durationSec: input.durationSec,
      activityLog: input.activityLog as object,
      videoLocalPath: input.videoLocalPath,
    },
  })
}

export async function saveReflection(sessionId: string, data: ReflectionOutput) {
  return prisma.reflection.create({
    data: {
      sessionId,
      accomplishments: data.accomplishments,
      distractions: data.distractions,
      focusScore: data.focusScore,
      keyInsight: data.keyInsight,
      nextStep: data.nextStep,
      encouragement: data.encouragement,
    },
  })
}

export async function saveLinkedInPost(sessionId: string, data: ContentCreatorOutput) {
  return prisma.linkedInPost.create({
    data: {
      sessionId,
      hook: data.hook,
      body: data.body,
      cta: data.cta,
      hashtags: data.hashtags,
      fullPost: data.fullPost,
    },
  })
}

export async function saveReel(sessionId: string, data: ReelsGeneratorOutput) {
  return prisma.reel.create({
    data: {
      sessionId,
      narrationScript: data.narrationScript,
      overlaySequence: data.overlaySequence as object,
      hookText: data.hookText,
      ctaText: data.ctaText,
      musicMood: data.musicMood,
      estimatedDurationSec: data.estimatedDurationSec,
    },
  })
}

export async function findSessionById(id: string) {
  return prisma.session.findUnique({
    where: { id },
    include: { reflection: true, linkedInPost: true, reel: true, goal: true },
  })
}
