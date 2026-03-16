'use client'

import { useReviewerStore } from '@/stores/reviewer-store'
import type { Reviewer } from '@/domain/intent-model/types'

export function ReviewerSelector({ reviewers }: { reviewers: Reviewer[] }) {
  const { currentReviewerId, setCurrentReviewer } = useReviewerStore()

  return (
    <select
      value={currentReviewerId ?? ''}
      onChange={e => setCurrentReviewer(e.target.value)}
      className="text-xs border border-white/20 rounded px-2 py-1 bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
    >
      <option value="" disabled className="bg-[#002C61] text-white">Select reviewer</option>
      {reviewers.map(r => (
        <option key={r.id} value={r.id} className="bg-[#002C61] text-white">{r.name}</option>
      ))}
    </select>
  )
}
