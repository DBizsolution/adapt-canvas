import { readFile } from 'node:fs/promises'
import { REVIEW_STATE_PATH } from '@/lib/paths'
import { ReviewerSelector } from '@/components/review/reviewer-selector'
import type { ReviewState } from '@/domain/intent-model/types'
import Link from 'next/link'

const navItems = [
  { label: 'Dashboard', href: '/review' },
  { label: 'Actors', href: '/review/actors' },
  { label: 'Entities', href: '/review/entities' },
  { label: 'Journeys', href: '/review/journeys' },
  { label: 'Business Rules', href: '/review/business-rules' },
  { label: 'Constraints', href: '/review/constraints' },
  { label: 'Open Questions', href: '/review/open-questions' },
  { label: 'Diff', href: '/review/diff' },
]

export default async function ReviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const raw = await readFile(REVIEW_STATE_PATH, 'utf-8')
  const reviewState: ReviewState = JSON.parse(raw)

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-semibold">VBS Intent Model</h1>
            <nav className="flex gap-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <ReviewerSelector reviewers={reviewState.reviewers} />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
