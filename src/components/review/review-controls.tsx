'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { EnrichedSectionReview } from '@/lib/review-utils'

type ReviewControlsProps = {
  section: EnrichedSectionReview
  currentReviewerId: string
}

export function ReviewControls({ section, currentReviewerId }: ReviewControlsProps) {
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
        window.location.reload()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 pt-4 border-t">
      <Textarea
        placeholder="Optional comment..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="min-h-[80px] text-base"
      />
      <div className="flex gap-3">
        <Button
          size="default"
          variant="default"
          onClick={() => submitReview('approve')}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          Approve
        </Button>
        <Button
          size="default"
          variant="default"
          onClick={() => submitReview('dispute')}
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700"
        >
          Dispute
        </Button>
      </div>
    </div>
  )
}
