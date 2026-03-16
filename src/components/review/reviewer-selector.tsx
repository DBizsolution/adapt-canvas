'use client'

import { useReviewerStore } from '@/stores/reviewer-store'
import type { Reviewer } from '@/domain/intent-model/types'

export function ReviewerSelector({ reviewers }: { reviewers: Reviewer[] }) {
  const { currentReviewerId, setCurrentReviewer } = useReviewerStore()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Reviewing as:</span>
      <select
        value={currentReviewerId ?? ''}
        onChange={e => setCurrentReviewer(e.target.value)}
        className="text-sm border rounded-md px-2 py-1 bg-background"
      >
        <option value="" disabled>Select reviewer</option>
        {reviewers.map(r => (
          <option key={r.id} value={r.id}>{r.name} ({r.role.replace('_', ' ')})</option>
        ))}
      </select>
    </div>
  )
}
