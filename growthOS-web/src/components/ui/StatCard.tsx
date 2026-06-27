import type { ReactNode } from 'react'
import { Card } from './Card'

export function StatCard({
  label,
  value,
  sub,
  emphasis = false,
  icon,
  children,
}: {
  label: string
  value: string | number
  sub?: string
  emphasis?: boolean
  icon?: ReactNode
  children?: ReactNode
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        {icon && (
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              emphasis ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            {icon}
          </span>
        )}
      </div>
      <p
        className={`mt-3 text-4xl font-bold tracking-tight tabular-nums ${
          emphasis ? 'text-emerald-600' : 'text-slate-900'
        }`}
      >
        {value}
        {sub && <span className="ml-1 text-base font-medium text-slate-400">{sub}</span>}
      </p>
      {children}
    </Card>
  )
}
