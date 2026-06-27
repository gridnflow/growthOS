import { getCurrentUserId } from '@/lib/currentUser'
import * as sessionsService from '@/modules/sessions/service'

// Render per request against live DB state (no auth() to force dynamic anymore).
export const dynamic = 'force-dynamic'

import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SessionRow } from '@/components/ui/SessionRow'
import type { SessionRowView } from '@/components/ui/SessionRow'
import { formatDuration, formatDateTime } from '@/lib/format'

export default async function SessionsPage() {
  const userId = await getCurrentUserId()
  const { sessions, summary } = userId
    ? await sessionsService.getRecentSessions(userId)
    : { sessions: [], summary: { totalSessions: 0, totalFocusSec: 0 } }

  const rows: SessionRowView[] = sessions.map((s) => ({
    id: s.id,
    startedAtLabel: formatDateTime(s.startedAt),
    goalTitle: s.goal.title,
    inProgress: s.endedAt === null,
    durationLabel: s.durationSec != null ? formatDuration(s.durationSec) : null,
    focusScore: s.focusScore,
    hasReflection: s.hasReflection,
    hasPost: s.hasPost,
    hasReel: s.hasReel,
  }))

  return (
    <>
      <PageHeader title="Sessions" description="집중 세션 기록" />

      {rows.length === 0 ? (
        <EmptyState
          title="아직 기록된 세션이 없습니다"
          description="트래킹 에이전트로 첫 집중 세션을 시작하세요"
        />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200/70">
              <span className="font-semibold tabular-nums text-slate-900">
                {summary.totalSessions}
              </span>
              sessions
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200/70">
              <span className="font-semibold tabular-nums text-slate-900">
                {formatDuration(summary.totalFocusSec)}
              </span>
              focused
            </span>
          </div>
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/70 bg-white shadow-sm">
            {rows.map((row) => (
              <SessionRow key={row.id} session={row} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
