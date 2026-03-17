'use client'

import { useReviewerStore } from '@/stores/reviewer-store'
import type { Reviewer } from '@/domain/intent-model/types'

export function ReviewerSelector({ reviewers }: { reviewers: Reviewer[] }) {
  const { currentReviewerId, setCurrentReviewer } = useReviewerStore()

  return (
    <select
      value={currentReviewerId ?? ''}
      onChange={e => setCurrentReviewer(e.target.value)}
      className="rounded-lg px-2 py-1 text-xs outline-none transition-colors duration-200"
      style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border-dark)',
        color: 'var(--text-primary)',
      }}
    >
      <option value="" disabled>Select reviewer</option>
      {reviewers.map(r => (
        <option key={r.id} value={r.id}>{r.name}</option>
      ))}
    </select>
  )
}
