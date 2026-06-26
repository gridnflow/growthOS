import { Card } from './Card'
import { Badge } from './Badge'
import { statusTone } from './statusTone'

export type ReelCardView = {
  id: string
  hookText: string
  narrationScript: string
  musicMood: string
  estimatedDurationSec: number
  overlayCount: number
  status: string
  sessionGoalTitle: string
  createdAtLabel: string
}

export function ReelCard({ reel }: { reel: ReelCardView }) {
  return (
    <Card>
      <Badge tone={statusTone(reel.status)}>{reel.status}</Badge>
      <p className="mt-3 font-semibold text-gray-900">{reel.hookText}</p>
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <span>{reel.estimatedDurationSec}s</span>
        <span className="text-gray-300">·</span>
        <Badge tone="neutral">{reel.musicMood}</Badge>
        <span className="text-gray-300">·</span>
        <span>{reel.overlayCount} overlays</span>
      </div>
      <p className="mt-2 line-clamp-3 text-sm text-gray-600">{reel.narrationScript}</p>
      <p className="mt-4 text-xs text-gray-400">
        {reel.sessionGoalTitle} · {reel.createdAtLabel}
      </p>
    </Card>
  )
}
