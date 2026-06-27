'use client'

import Link from 'next/link'
import type { Route } from 'next'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

function Icon({ path }: { path: string }) {
  return (
    <svg
      className="h-[18px] w-[18px] shrink-0"
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

const NAV_ITEMS: Array<{ href: Route; label: string; icon: ReactNode }> = [
  { href: '/dashboard', label: 'Dashboard', icon: <Icon path="M3 12l9-9 9 9M5 10v10h14V10" /> },
  { href: '/dashboard/goals', label: 'Goals', icon: <Icon path="M12 2v20M2 12h20M12 7a5 5 0 100 10 5 5 0 000-10z" /> },
  { href: '/dashboard/sessions', label: 'Sessions', icon: <Icon path="M12 7v5l3 3M12 21a9 9 0 110-18 9 9 0 010 18z" /> },
  { href: '/dashboard/content', label: 'Content', icon: <Icon path="M4 5h16M4 12h16M4 19h10" /> },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SidebarNav({ className = '' }: { className?: string }) {
  const pathname = usePathname()
  return (
    <nav className={className}>
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              active
                ? 'bg-indigo-50 font-semibold text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
