import type { ReactNode } from 'react'
import { Card } from './Card'

export function StatCard({
  label,
  value,
  sub,
  emphasis = false,
  children,
}: {
  label: string
  value: string | number
  sub?: string
  emphasis?: boolean
  children?: ReactNode
}) {
  return (
    <Card>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p
        className={`mt-2 text-3xl font-bold ${emphasis ? 'text-emerald-600' : 'text-gray-900'}`}
      >
        {value}
        {sub && <span className="ml-1 text-base font-normal text-gray-400">{sub}</span>}
      </p>
      {children}
    </Card>
  )
}
