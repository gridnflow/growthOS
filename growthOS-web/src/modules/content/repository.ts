import { prisma } from '@/lib/prisma'

export async function findPostsByUser(userId: string) {
  return prisma.linkedInPost.findMany({
    where: { session: { userId } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      hook: true,
      body: true,
      hashtags: true,
      status: true,
      createdAt: true,
      session: { select: { goal: { select: { title: true } } } },
    },
  })
}

export async function findReelsByUser(userId: string) {
  return prisma.reel.findMany({
    where: { session: { userId } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      hookText: true,
      narrationScript: true,
      musicMood: true,
      estimatedDurationSec: true,
      overlaySequence: true,
      status: true,
      createdAt: true,
      session: { select: { goal: { select: { title: true } } } },
    },
  })
}
