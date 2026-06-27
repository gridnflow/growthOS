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
    <Card interactive>
      <div className="flex items-start justify-between gap-3">
        <Badge tone={statusTone(reel.status)}>{reel.status}</Badge>
        <span className="text-xs text-slate-400">{reel.createdAtLabel}</span>
      </div>
      <p className="mt-3 text-base font-semibold leading-snug text-slate-900">
        {reel.hookText}
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        <span className="tabular-nums">{reel.estimatedDurationSec}s</span>
        <span className="text-slate-300">·</span>
        <Badge tone="accent">{reel.musicMood}</Badge>
        <span className="text-slate-300">·</span>
        <span className="tabular-nums">{reel.overlayCount} overlays</span>
      </div>
      <p className="mt-2 line-clamp-3 text-sm text-slate-600">{reel.narrationScript}</p>
      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
        {reel.sessionGoalTitle}
      </p>
    </Card>
  )
}
