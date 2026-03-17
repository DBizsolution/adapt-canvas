'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Database,
  Route,
  Scale,
  Lock,
  HelpCircle,
  GitCompare,
  Settings,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/review', icon: LayoutDashboard },
  { label: 'Actors', href: '/review/actors', icon: Users },
  { label: 'Entities', href: '/review/entities', icon: Database },
  { label: 'Journeys', href: '/review/journeys', icon: Route },
  { label: 'Rules', href: '/review/business-rules', icon: Scale },
  { label: 'Constraints', href: '/review/constraints', icon: Lock },
  { label: 'Open Qs', href: '/review/open-questions', icon: HelpCircle },
  { label: 'Diff', href: '/review/diff', icon: GitCompare },
]

export function NavSidebar() {
  const pathname = usePathname()

  return (
    <nav
      className="flex w-[200px] shrink-0 flex-col py-3 px-2"
      style={{ background: 'var(--bg-nav)', height: '100vh' }}
    >
      {/* Logo */}
      <div className="mb-4 flex items-center gap-2.5 px-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
          style={{ background: 'var(--acfs-navy)', color: 'var(--text-white)' }}
        >
          V
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          VBS Intent
        </span>
      </div>

      {/* Nav items */}
      <div className="flex flex-1 flex-col gap-0.5">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = item.href === '/review'
            ? pathname === '/review'
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-200"
              style={{
                background: isActive ? 'var(--bg-blue-subtle)' : 'transparent',
                color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Bottom: settings */}
      <Link
        href="#"
        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-200"
        style={{ color: 'var(--text-muted)' }}
      >
        <Settings size={18} />
        <span>Settings</span>
      </Link>
    </nav>
  )
}
