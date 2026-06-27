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
    <Card interactive>
      <div className="flex items-start justify-between gap-3">
        <Badge tone={statusTone(post.status)}>{post.status}</Badge>
        <span className="text-xs text-slate-400">{post.createdAtLabel}</span>
      </div>
      <p className="mt-3 text-base font-semibold leading-snug text-slate-900">{post.hook}</p>
      <p className="mt-2 line-clamp-3 text-sm text-slate-600">{post.body}</p>
      {post.hashtags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.hashtags.map((tag) => (
            <span
              key={tag}
              className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
        {post.sessionGoalTitle}
      </p>
    </Card>
  )
}
