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
      className="flex w-[52px] shrink-0 flex-col items-center gap-1 py-3"
      style={{ background: 'var(--bg-nav)', height: '100vh' }}
    >
      {/* Logo mark */}
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold" style={{ background: 'var(--accent-blue)', color: 'var(--text-white)' }}>
        V
      </div>

      {/* Nav icons */}
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
              title={item.label}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200"
              style={{
                background: isActive ? 'var(--bg-blue-subtle)' : 'transparent',
                color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={20} />
            </Link>
          )
        })}
      </div>

      {/* Bottom: settings */}
      <Link
        href="#"
        title="Settings"
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200"
        style={{ color: 'var(--text-muted)' }}
      >
        <Settings size={20} />
      </Link>
    </nav>
  )
}
