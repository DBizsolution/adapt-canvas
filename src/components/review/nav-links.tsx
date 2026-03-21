'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { projectConfig } from '@/lib/project-config'
import {
  LayoutDashboard,
  GitCompare,
  FileText,
  Settings,
  Map,
  ClipboardList,
  Network,
} from 'lucide-react'

const navItems = [
  { label: 'Explorer', href: '/', icon: Network },
  { label: 'Consensus', href: '/review', icon: LayoutDashboard },
  { label: 'BRD', href: '/review/brd', icon: ClipboardList },
  { label: 'IA Map', href: '/review/ia', icon: Map },
  { label: 'Diff', href: '/review/diff', icon: GitCompare },
  { label: 'Docs', href: '/review/docs', icon: FileText },
]

export function NavSidebar() {
  const pathname = usePathname()

  return (
    <nav className="nav-sidebar flex w-[200px] shrink-0 flex-col py-3 px-2">
      {/* Logo — links home */}
      <Link href="/" className="mb-4 flex items-center gap-2.5 px-2 no-underline">
        <div className="nav-logo flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold">
          {projectConfig.iconLetter}
        </div>
        <span className="nav-title text-sm font-semibold">
          {projectConfig.shortName}
        </span>
      </Link>

      {/* Nav items */}
      <div className="flex flex-1 flex-col gap-0.5">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = item.href === '/'
            ? pathname === '/'
            : item.href === '/review'
              ? pathname.startsWith('/review') && !pathname.startsWith('/review/brd') && !pathname.startsWith('/review/ia') && !pathname.startsWith('/review/diff') && !pathname.startsWith('/review/docs')
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
