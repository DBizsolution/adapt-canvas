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
    <nav className="nav-sidebar flex w-[200px] shrink-0 flex-col py-3 px-2">
      {/* Logo — links home */}
      <Link href="/review" className="mb-4 flex items-center gap-2.5 px-2 no-underline">
        <div className="nav-logo flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold">
          V
        </div>
        <span className="nav-title text-sm font-semibold">
          VBS Intent
        </span>
      </Link>

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
              className={`nav-item flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-200 ${isActive ? 'nav-item-active' : ''}`}
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
        className="nav-item nav-item-muted flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-200"
      >
        <Settings size={18} />
        <span>Settings</span>
      </Link>
    </nav>
  )
}
