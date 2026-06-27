import type { ReactNode } from 'react'
import Link from 'next/link'
import { SidebarNav } from '@/components/SidebarNav'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 border-b border-slate-100 px-3 pb-4 text-lg font-bold tracking-tight"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-xs text-white">
            G
          </span>
          <span className="text-slate-900">
            Growth<span className="text-indigo-600">OS</span>
          </span>
        </Link>
        <SidebarNav className="mt-4 flex flex-col gap-1" />
      </aside>

      <div className="md:pl-56">
        <header className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur md:hidden">
          <SidebarNav className="flex gap-1 overflow-x-auto" />
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  )
}
