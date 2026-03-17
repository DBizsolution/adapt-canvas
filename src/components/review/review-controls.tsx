'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import type { EnrichedSectionReview } from '@/lib/review-utils'

type ReviewControlsProps = {
  section: EnrichedSectionReview
  currentReviewerId: string
}

export function ReviewControls({ section, currentReviewerId }: ReviewControlsProps) {
  const router = useRouter()
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function submitReview(action: 'approve' | 'dispute') {
    setLoading(true)
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: section.targetId,
          reviewerId: currentReviewerId,
          action,
          comment: comment || undefined,
        }),
      })
      if (res.ok) {
        setComment('')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
      <Textarea
        placeholder="Optional comment..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="min-h-[80px] text-sm"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => submitReview('approve')}
          disabled={loading}
          className="rounded-[10px] px-4 py-2 text-sm font-medium transition-colors duration-200 disabled:opacity-50"
          style={{ background: 'var(--acfs-navy)', color: 'var(--text-white)' }}
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => submitReview('dispute')}
          disabled={loading}
          className="rounded-[10px] px-4 py-2 text-sm font-medium transition-colors duration-200 disabled:opacity-50"
          style={{ background: 'transparent', color: '#BE123C', border: '1px solid #E11D48' }}
        >
          Dispute
        </button>
      </div>
    </div>
  )
}
