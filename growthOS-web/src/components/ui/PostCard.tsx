import { Card } from './Card'
import { Badge } from './Badge'
import { statusTone } from './statusTone'

export type PostCardView = {
  id: string
  hook: string
  body: string
  hashtags: string[]
  status: string
  sessionGoalTitle: string
  createdAtLabel: string
}

export function PostCard({ post }: { post: PostCardView }) {
  return (
    <Card>
      <Badge tone={statusTone(post.status)}>{post.status}</Badge>
      <p className="mt-3 font-semibold text-gray-900">{post.hook}</p>
      <p className="mt-1 line-clamp-3 text-sm text-gray-600">{post.body}</p>
      {post.hashtags.length > 0 && (
        <p className="mt-2 text-xs text-gray-400">{post.hashtags.join(' ')}</p>
      )}
      <p className="mt-4 text-xs text-gray-400">
        {post.sessionGoalTitle} · {post.createdAtLabel}
      </p>
    </Card>
  )
}
