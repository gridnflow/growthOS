import * as contentRepository from './repository'
import type { ContentItems, PostItem, ReelItem } from './types'

export async function getContentItems(userId: string): Promise<ContentItems> {
  const [postRows, reelRows] = await Promise.all([
    contentRepository.findPostsByUser(userId),
    contentRepository.findReelsByUser(userId),
  ])

  const posts: PostItem[] = postRows.map((row) => ({
    id: row.id,
    hook: row.hook,
    body: row.body,
    hashtags: row.hashtags,
    status: row.status,
    sessionGoalTitle: row.session.goal.title,
    createdAt: row.createdAt,
  }))

  const reels: ReelItem[] = reelRows.map((row) => ({
    id: row.id,
    hookText: row.hookText,
    narrationScript: row.narrationScript,
    musicMood: row.musicMood,
    estimatedDurationSec: row.estimatedDurationSec,
    overlayCount: Array.isArray(row.overlaySequence) ? row.overlaySequence.length : 0,
    status: row.status,
    sessionGoalTitle: row.session.goal.title,
    createdAt: row.createdAt,
  }))

  return { posts, reels }
}
