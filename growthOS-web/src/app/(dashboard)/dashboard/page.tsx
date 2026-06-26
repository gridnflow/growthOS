import Link from 'next/link'
import { getCurrentUserId } from '@/lib/currentUser'

// Dashboard reflects live DB state per request; without auth() forcing this,
// declare it explicitly so the page isn't statically prerendered at build time.
export const dynamic = 'force-dynamic'

import * as analyticsService from '@/modules/analytics/service'
import * as goalsService from '@/modules/goals/service'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { statusTone } from '@/components/ui/statusTone'
import { formatMinutes } from '@/lib/format'

export default async function DashboardPage() {
  const userId = await getCurrentUserId()
  if (!userId) {
    return (
      <>
        <PageHeader title="Dashboard" description="오늘의 집중 현황" />
        <EmptyState title="계정을 준비하는 중입니다" description="잠시 후 다시 시도해 주세요" />
      </>
    )
  }

  const [summary, goals, todayTasks] = await Promise.all([
    analyticsService.getDashboardSummary(userId),
    goalsService.getGoals(userId),
    goalsService.getTodayTasks(userId),
  ])

  if (goals.length === 0) {
    return (
      <>
        <PageHeader title="Dashboard" description="오늘의 집중 현황" />
        <EmptyState
          title="첫 목표를 만들어 보세요"
          description="목표를 등록하면 AI가 주간 계획을 세워줍니다"
          action={
            <Link
              href="/dashboard/goals"
              className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
              Goals로 이동
            </Link>
          }
        />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Dashboard" description="오늘의 집중 현황" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          label="Current Streak"
          value={summary.currentStreak}
          sub="days"
          emphasis={summary.currentStreak > 0}
        />
        <StatCard label="Overall Progress" value={`${summary.overallProgressPct}%`}>
          <div className="mt-4">
            <ProgressBar value={summary.overallProgressPct} />
          </div>
        </StatCard>
        <StatCard label="Today's Focus" value={formatMinutes(summary.todayFocusedMin)} />
      </div>

      <Card className="mt-6">
        <p className="text-sm font-medium text-gray-500">Today&apos;s Tasks</p>
        {todayTasks.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="오늘 예정된 할 일이 없습니다" />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {todayTasks.map((task) => (
              <li key={task.id} className="flex items-center gap-3 py-3">
                <Badge tone={statusTone(task.status)}>{task.status}</Badge>
                <span className="text-sm text-gray-900">{task.title}</span>
                <span className="text-sm text-gray-400">· {task.estimatedMin}m</span>
                <span className="ml-auto text-sm text-gray-400">
                  {task.plan.goal.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
