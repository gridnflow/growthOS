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
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatMinutes } from '@/lib/format'
import { TodayTaskItem } from '@/components/TodayTaskItem'

function StatIcon({ path }: { path: string }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

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
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-700"
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Current Streak"
          value={summary.currentStreak}
          sub="days"
          emphasis={summary.currentStreak > 0}
          icon={<StatIcon path="M12 2c1 3-1 4-1 6a3 3 0 006 0c0-1 0-2-1-3 2 1 4 4 4 7a8 8 0 11-16 0c0-4 3-6 4-8 1 1 2 2 4-2z" />}
        />
        <StatCard
          label="Overall Progress"
          value={`${summary.overallProgressPct}%`}
          icon={<StatIcon path="M3 17l5-5 4 4 8-8M21 8v5M21 8h-5" />}
        >
          <div className="mt-4">
            <ProgressBar value={summary.overallProgressPct} />
          </div>
        </StatCard>
        <StatCard
          label="Today's Focus"
          value={formatMinutes(summary.todayFocusedMin)}
          icon={<StatIcon path="M12 7v5l3 3M12 21a9 9 0 110-18 9 9 0 010 18z" />}
        />
      </div>

      <Card className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Today&apos;s Tasks
        </p>
        {todayTasks.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="오늘 예정된 할 일이 없습니다" />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {todayTasks.map((task) => (
              <TodayTaskItem
                key={task.id}
                id={task.id}
                title={task.title}
                estimatedMin={task.estimatedMin}
                status={task.status}
                goalTitle={task.plan.goal.title}
              />
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
