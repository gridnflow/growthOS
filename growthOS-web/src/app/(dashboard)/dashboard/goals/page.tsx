import { getCurrentUserId } from '@/lib/currentUser'
import * as goalsService from '@/modules/goals/service'

// Render per request against live DB state (no auth() to force dynamic anymore).
export const dynamic = 'force-dynamic'

import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { statusTone } from '@/components/ui/statusTone'
import { formatDate } from '@/lib/format'
import { NewGoalForm } from '@/components/NewGoalForm'

function DDayBadge({ deadline }: { deadline: Date }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(deadline)
  target.setHours(0, 0, 0, 0)
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000)

  if (days > 0) return <Badge tone="accent">D-{days}</Badge>
  if (days < 0) return <Badge tone="warn">Overdue</Badge>
  return <Badge tone="accent">D-day</Badge>
}

export default async function GoalsPage() {
  const userId = await getCurrentUserId()
  const goals = userId ? await goalsService.getAllGoals(userId) : []

  return (
    <>
      <PageHeader title="Goals" description="전체 목표" action={<NewGoalForm />} />

      {goals.length === 0 ? (
        <EmptyState
          title="아직 목표가 없습니다"
          description="목표와 마감일을 입력하면 AI가 주간·일별 task로 나눠줍니다"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {goals.map((goal) => (
            <Card key={goal.id} interactive>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-semibold text-indigo-600">
                  {goal.title.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold text-slate-900">{goal.title}</h2>
                    <Badge tone={statusTone(goal.status)} withDot>
                      {goal.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Deadline {formatDate(goal.deadline)} · {goal.dailyHours}h/day
                  </p>
                  <div className="mt-4">
                    <DDayBadge deadline={goal.deadline} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
