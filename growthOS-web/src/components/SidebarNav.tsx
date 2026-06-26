'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'

const NAV_ITEMS: Array<{ href: Route; label: string }> = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/goals', label: 'Goals' },
  { href: '/dashboard/sessions', label: 'Sessions' },
  { href: '/dashboard/content', label: 'Content' },
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
            className={`rounded-lg px-3 py-2 text-sm ${
              active
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
