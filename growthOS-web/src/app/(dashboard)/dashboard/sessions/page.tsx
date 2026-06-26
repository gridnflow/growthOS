import { getInternalUserId } from '@/lib/clerk'
import * as sessionsService from '@/modules/sessions/service'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { SessionRow } from '@/components/ui/SessionRow'
import type { SessionRowView } from '@/components/ui/SessionRow'
import { formatDuration, formatDateTime } from '@/lib/format'

export default async function SessionsPage() {
  const userId = await getInternalUserId()
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
          <p className="mb-4 text-sm text-gray-500">
            {summary.totalSessions} sessions · {formatDuration(summary.totalFocusSec)} focused
          </p>
          <Card className="divide-y divide-gray-100 p-0">
            {rows.map((row) => (
              <SessionRow key={row.id} session={row} />
            ))}
          </Card>
        </>
      )}
    </>
  )
}
