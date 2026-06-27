import type { ReactNode } from 'react'

export type BadgeTone = 'positive' | 'progress' | 'neutral' | 'warn' | 'accent'

const toneClasses: Record<BadgeTone, string> = {
  positive: 'text-emerald-700 bg-emerald-50 ring-1 ring-inset ring-emerald-600/20',
  progress: 'text-amber-700 bg-amber-50 ring-1 ring-inset ring-amber-600/20',
  neutral: 'text-slate-600 bg-slate-100 ring-1 ring-inset ring-slate-500/15',
  warn: 'text-rose-700 bg-rose-50 ring-1 ring-inset ring-rose-600/20',
  accent: 'text-indigo-700 bg-indigo-50 ring-1 ring-inset ring-indigo-600/20',
}

export function Badge({
  tone,
  children,
  withDot = false,
}: {
  tone: BadgeTone
  children: ReactNode
  withDot?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {withDot && (
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      )}
      {children}
    </span>
  )
}
