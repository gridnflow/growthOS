'use client'

import { useState } from 'react'
import { PostCard } from '@/components/ui/PostCard'
import type { PostCardView } from '@/components/ui/PostCard'
import { ReelCard } from '@/components/ui/ReelCard'
import type { ReelCardView } from '@/components/ui/ReelCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'

type Tab = 'posts' | 'reels'

export function ContentTabs({
  posts,
  reels,
}: {
  posts: PostCardView[]
  reels: ReelCardView[]
}) {
  const [tab, setTab] = useState<Tab>('posts')

  return (
    <div>
      <div className="mb-6 flex gap-6 border-b border-slate-200">
        <TabButton active={tab === 'posts'} onClick={() => setTab('posts')}>
          LinkedIn Posts <Badge tone="accent">{posts.length}</Badge>
        </TabButton>
        <TabButton active={tab === 'reels'} onClick={() => setTab('reels')}>
          Reels <Badge tone="accent">{reels.length}</Badge>
        </TabButton>
      </div>

      {tab === 'posts' ? (
        posts.length === 0 ? (
          <EmptyState title="아직 생성된 포스트가 없습니다" />
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )
      ) : reels.length === 0 ? (
        <EmptyState title="아직 생성된 릴스가 없습니다" />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm transition ${
        active
          ? 'border-indigo-600 font-medium text-indigo-600'
          : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  )
}
