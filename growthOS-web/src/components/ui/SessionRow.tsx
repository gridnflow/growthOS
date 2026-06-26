import Link from 'next/link'
import type { Route } from 'next'
import { Badge } from './Badge'

// Date/duration are pre-formatted to strings by the page so no Date object reaches
// the client tree (DESIGN.md §7-2).
export type SessionRowView = {
  id: string
  startedAtLabel: string
  goalTitle: string
  inProgress: boolean
  durationLabel: string | null
  focusScore: number | null
  hasReflection: boolean
  hasPost: boolean
  hasReel: boolean
}

function ArtifactChip({ present, label }: { present: boolean; label: string }) {
  return present ? <Badge tone="positive">{label}</Badge> : <Badge tone="neutral">—</Badge>
}

export function SessionRow({ session }: { session: SessionRowView }) {
  return (
    <Link
      // The session detail route (/dashboard/sessions/[id]) is a follow-up task
      // (DESIGN.md §4-3), so it isn't a known typed route yet.
      href={`/dashboard/sessions/${session.id}` as Route}
      className="flex flex-col gap-3 px-6 py-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="text-sm text-gray-900">{session.startedAtLabel}</p>
        <p className="truncate text-sm text-gray-400">{session.goalTitle}</p>
      </div>

      <div className="text-sm text-gray-500">
        {session.inProgress ? (
          <Badge tone="progress">In progress</Badge>
        ) : (
          <span>{session.durationLabel}</span>
        )}
        <span className="mx-2 text-gray-300">·</span>
        Focus {session.focusScore ?? '—'}
        {session.focusScore != null && '/100'}
      </div>

      <div className="flex items-center gap-2">
        <ArtifactChip present={session.hasReflection} label="Reflection" />
        <ArtifactChip present={session.hasPost} label="Post" />
        <ArtifactChip present={session.hasReel} label="Reel" />
      </div>
    </Link>
  )
}
