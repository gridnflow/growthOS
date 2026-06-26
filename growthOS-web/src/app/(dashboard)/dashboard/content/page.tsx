import { getCurrentUserId } from '@/lib/currentUser'
import * as contentService from '@/modules/content/service'

// Render per request against live DB state (no auth() to force dynamic anymore).
export const dynamic = 'force-dynamic'

import { PageHeader } from '@/components/ui/PageHeader'
import { ContentTabs } from '@/components/ContentTabs'
import type { PostCardView } from '@/components/ui/PostCard'
import type { ReelCardView } from '@/components/ui/ReelCard'
import { formatDate } from '@/lib/format'

export default async function ContentPage() {
  const userId = await getCurrentUserId()
  const { posts, reels } = userId
    ? await contentService.getContentItems(userId)
    : { posts: [], reels: [] }

  // Serialize Date to string here so no Date object reaches the Client tab tree.
  const postViews: PostCardView[] = posts.map((p) => ({
    id: p.id,
    hook: p.hook,
    body: p.body,
    hashtags: p.hashtags,
    status: p.status,
    sessionGoalTitle: p.sessionGoalTitle,
    createdAtLabel: formatDate(p.createdAt),
  }))

  const reelViews: ReelCardView[] = reels.map((r) => ({
    id: r.id,
    hookText: r.hookText,
    narrationScript: r.narrationScript,
    musicMood: r.musicMood,
    estimatedDurationSec: r.estimatedDurationSec,
    overlayCount: r.overlayCount,
    status: r.status,
    sessionGoalTitle: r.sessionGoalTitle,
    createdAtLabel: formatDate(r.createdAt),
  }))

  return (
    <>
      <PageHeader title="Content" description="AI가 생성한 발행 콘텐츠" />
      <ContentTabs posts={postViews} reels={reelViews} />
    </>
  )
}
