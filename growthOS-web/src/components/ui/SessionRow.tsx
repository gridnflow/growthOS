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

function ChevronRight() {
  return (
    <svg
      className="h-5 w-5 text-slate-300 transition group-hover:text-slate-400"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SessionRow({ session }: { session: SessionRowView }) {
  return (
    <Link
      // The session detail route (/dashboard/sessions/[id]) is a follow-up task
      // (DESIGN.md §4-3), so it isn't a known typed route yet.
      href={`/dashboard/sessions/${session.id}` as Route}
      className="group flex items-center gap-4 px-5 py-4 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-semibold text-indigo-600">
        {session.goalTitle.charAt(0).toUpperCase()}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{session.startedAtLabel}</p>
        <p className="truncate text-xs text-slate-400">{session.goalTitle}</p>
      </div>

      <div className="hidden text-sm tabular-nums text-slate-600 sm:block">
        {session.inProgress ? (
          <Badge tone="progress">In progress</Badge>
        ) : (
          <span>{session.durationLabel}</span>
        )}
        <span className="mx-2 text-slate-300">·</span>
        Focus {session.focusScore ?? '—'}
        {session.focusScore != null && '/100'}
      </div>

      <div className="hidden items-center gap-1.5 md:flex">
        {session.hasReflection && <Badge tone="positive">Reflection</Badge>}
        {session.hasPost && <Badge tone="positive">Post</Badge>}
        {session.hasReel && <Badge tone="positive">Reel</Badge>}
      </div>

      <ChevronRight />
    </Link>
  )
}
