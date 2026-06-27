import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
  interactive = false,
}: {
  children: ReactNode
  className?: string
  interactive?: boolean
}) {
  const base = 'bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 sm:p-6'
  const hover = interactive ? ' transition hover:shadow-md hover:border-slate-300' : ''
  return <div className={`${base}${hover} ${className}`}>{children}</div>
}
