'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Creating a goal triggers the Goal Planner + Task Breakdown agents server-side,
// so the submit can take several seconds — the form stays disabled with a
// pending label until the API responds, then refreshes the goal list.
export function NewGoalForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [dailyHours, setDailyHours] = useState('2')
  const [currentLevel, setCurrentLevel] = useState('')

  function reset() {
    setTitle('')
    setDeadline('')
    setDailyHours('2')
    setCurrentLevel('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          deadline,
          dailyHours: Number(dailyHours),
          currentLevel: currentLevel || undefined,
        }),
      })
      if (!res.ok) throw new Error(`목표 생성 실패 (HTTP ${res.status})`)
      reset()
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
    } finally {
      setPending(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
      >
        새 목표
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">목표</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: AI Product Manager 되기"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">마감일</label>
            <input
              required
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>
          <div className="w-28">
            <label className="block text-sm font-medium text-gray-700">하루 시간</label>
            <input
              required
              type="number"
              min="1"
              max="16"
              value={dailyHours}
              onChange={(e) => setDailyHours(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">현재 수준 (선택)</label>
          <input
            value={currentLevel}
            onChange={(e) => setCurrentLevel(e.target.value)}
            placeholder="예: 주니어 개발자, PM 경험 없음"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {pending ? 'AI가 계획 생성 중…' : '목표 만들기'}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              reset()
            }}
            disabled={pending}
            className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
        </div>
      </div>
    </form>
  )
}
