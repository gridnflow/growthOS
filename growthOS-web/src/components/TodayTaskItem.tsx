'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { statusTone } from '@/components/ui/statusTone'

type Props = {
  id: string
  title: string
  estimatedMin: number
  status: string
  goalTitle: string
}

// One row in the dashboard's "Today's Tasks" list. Lets the user mark a task
// DONE or SKIPPED; the change drives the streak/progress aggregates so the
// page is refreshed afterwards to reflect the new numbers.
export function TodayTaskItem({ id, title, estimatedMin, status, goalTitle }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [current, setCurrent] = useState(status)

  async function update(next: string) {
    setPending(true)
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error()
      setCurrent(next)
      router.refresh()
    } catch {
      // leave the row as-is; a failed toggle just doesn't change state
    } finally {
      setPending(false)
    }
  }

  const done = current === 'DONE'
  const skipped = current === 'SKIPPED'

  return (
    <li className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-slate-50">
      <Badge tone={statusTone(current)} withDot>
        {current}
      </Badge>
      <span
        className={`text-sm ${done || skipped ? 'text-slate-400 line-through' : 'text-slate-900'}`}
      >
        {title}
      </span>
      <span className="text-sm tabular-nums text-slate-400">· {estimatedMin}m</span>
      <span className="ml-auto flex items-center gap-2">
        <span className="hidden text-sm text-slate-400 sm:inline">{goalTitle}</span>
        <button
          onClick={() => update(done ? 'TODO' : 'DONE')}
          disabled={pending}
          className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {done ? '되돌리기' : '완료'}
        </button>
        <button
          onClick={() => update(skipped ? 'TODO' : 'SKIPPED')}
          disabled={pending}
          className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {skipped ? '되돌리기' : '스킵'}
        </button>
      </span>
    </li>
  )
}
