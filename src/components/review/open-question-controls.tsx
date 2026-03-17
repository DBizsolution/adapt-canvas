'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Clock, ThumbsUp } from 'lucide-react'
import type { EnrichedSectionReview } from '@/lib/review-utils'

type OpenQuestionControlsProps = {
  section: EnrichedSectionReview
  currentReviewerId: string
  questionStatus: 'open' | 'deferred' | 'resolved'
}

type Mode = 'idle' | 'resolve' | 'defer'

export function OpenQuestionControls({ section, currentReviewerId, questionStatus }: OpenQuestionControlsProps) {
  const [mode, setMode] = useState<Mode>('idle')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function submitReview(action: 'approve' | 'resolve' | 'defer') {
    if ((action === 'resolve' || action === 'defer') && !comment.trim()) return
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
        setMode('idle')
        window.location.reload()
      }
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'idle') {
    if (questionStatus === 'resolved') {
      return (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => submitReview('approve')}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-sm font-medium transition-colors duration-200 disabled:opacity-50"
            style={{ background: 'var(--acfs-navy)', color: 'var(--text-white)' }}
          >
            <ThumbsUp size={14} />
            Confirm resolution
          </button>
        </div>
      )
    }

    return (
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setMode('resolve')}
          className="flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-sm font-medium transition-colors duration-200"
          style={{ background: 'var(--acfs-navy)', color: 'var(--text-white)' }}
        >
          <CheckCircle size={14} />
          Resolve
        </button>
        <button
          type="button"
          onClick={() => setMode('defer')}
          className="flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-sm font-medium transition-colors duration-200"
          style={{ background: 'var(--bg-gray-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-dark)' }}
        >
          <Clock size={14} />
          Defer
        </button>
      </div>
    )
  }

  const isResolve = mode === 'resolve'

  return (
    <div className="space-y-3">
      <div
        className="rounded-lg px-3 py-2.5 text-sm leading-relaxed"
        style={{
          background: isResolve ? 'rgba(37,186,59,0.04)' : 'var(--bg-card-gray)',
          border: isResolve ? '1px solid rgba(37,186,59,0.15)' : '1px solid var(--border-default)',
          color: 'var(--text-secondary)',
        }}
      >
        <p className="font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
          {isResolve ? 'Write the resolution' : 'Write the deferral reason'}
        </p>
        {isResolve ? (
          <div className="space-y-1">
            <p><span className="font-semibold">Decision:</span> State the answer clearly — e.g., &quot;Flat rate of $45 per HBL&quot;</p>
            <p><span className="font-semibold">Impact:</span> Note what this changes — e.g., &quot;Update booking entity fee_amount field description&quot;</p>
            <p><span className="font-semibold">Source:</span> Who decided this — e.g., &quot;Confirmed with PO in standup 2026-03-16&quot;</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p><span className="font-semibold">Reason:</span> Why this can wait — e.g., &quot;Depends on payment gateway selection in Phase 4&quot;</p>
            <p><span className="font-semibold">Revisit:</span> When to come back — e.g., &quot;Before Phase 4 domain typing&quot;</p>
          </div>
        )}
      </div>

      <Textarea
        placeholder={isResolve
          ? 'Decision: ...\nImpact: ...\nSource: ...'
          : 'Reason: ...\nRevisit: ...'
        }
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="min-h-[100px] text-sm font-mono"
      />

      <div className="text-sm leading-relaxed rounded px-3 py-2" style={{ background: 'var(--bg-card-gray)', color: 'var(--text-muted)' }}>
        <span className="font-semibold">What happens next:</span>
        {isResolve ? (
          <> Your resolution is saved in the review history. The model author reads it in Claude Code and updates model.ts —
            setting this question&apos;s status to &quot;resolved&quot; and its resolution field to your decision.
            The hash change triggers re-review so other reviewers can confirm.</>
        ) : (
          <> This question is marked as explicitly deferred. It stays in the model as a known gap.
            The model author updates the question status to &quot;deferred&quot; in model.ts.
            It won&apos;t block consensus on other sections.</>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => submitReview(isResolve ? 'resolve' : 'defer')}
          disabled={loading || !comment.trim()}
          className="rounded-[10px] px-4 py-2 text-sm font-medium transition-colors duration-200 disabled:opacity-50"
          style={{ background: 'var(--acfs-navy)', color: 'var(--text-white)' }}
        >
          {isResolve ? 'Submit Resolution' : 'Submit Deferral'}
        </button>
        <button
          type="button"
          onClick={() => { setMode('idle'); setComment('') }}
          disabled={loading}
          className="rounded-[10px] px-4 py-2 text-sm font-medium transition-colors duration-200"
          style={{ color: 'var(--text-secondary)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
