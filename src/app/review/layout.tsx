import { readFile } from 'node:fs/promises'
import { REVIEW_STATE_PATH } from '@/lib/paths'
import { ReviewerSelector } from '@/components/review/reviewer-selector'
import type { ReviewState } from '@/domain/intent-model/types'
import Link from 'next/link'
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

export default async function ReviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const raw = await readFile(REVIEW_STATE_PATH, 'utf-8')
  const reviewState: ReviewState = JSON.parse(raw)

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <header className="sticky top-0 z-10" style={{ backgroundColor: '#002C61' }}>
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-4">
          <h1 className="text-base font-bold text-white shrink-0">VBS Intent Model</h1>
          <nav className="flex gap-1 overflow-x-auto flex-1">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm px-2.5 py-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-white/60">Reviewer</span>
            <ReviewerSelector reviewers={reviewState.reviewers} />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 bg-[#F5F6FA] min-h-screen">
        {children}
      </main>
    </div>
  )
}
