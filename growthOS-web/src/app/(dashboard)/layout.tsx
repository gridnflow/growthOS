import type { ReactNode } from 'react'
import Link from 'next/link'
import { SidebarNav } from '@/components/SidebarNav'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r border-gray-200 bg-white px-4 py-6 md:flex">
        <Link href="/dashboard" className="px-3 text-lg font-bold text-gray-900">
          GrowthOS
        </Link>
        <SidebarNav className="mt-6 flex flex-col gap-1" />
      </aside>

      <div className="md:pl-56">
        <header className="border-b border-gray-200 bg-white px-8 py-4 md:hidden">
          <SidebarNav className="flex gap-1 overflow-x-auto" />
        </header>

        <main className="mx-auto max-w-6xl px-8 py-8">{children}</main>
      </div>
    </div>
  )
}
