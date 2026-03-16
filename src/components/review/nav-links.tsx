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

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto flex-1">
      {navItems.map(item => {
        const Icon = item.icon
        const isActive = item.href === '/review'
          ? pathname === '/review'
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
              isActive
                ? 'bg-white/15 text-white font-medium'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon size={14} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
