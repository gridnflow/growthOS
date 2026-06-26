import type { ReactNode } from 'react'

export type BadgeTone = 'positive' | 'progress' | 'neutral' | 'warn'

const toneClasses: Record<BadgeTone, string> = {
  positive: 'text-emerald-700 bg-emerald-50',
  progress: 'text-amber-700 bg-amber-50',
  neutral: 'text-gray-600 bg-gray-100',
  warn: 'text-rose-700 bg-rose-50',
}

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}
