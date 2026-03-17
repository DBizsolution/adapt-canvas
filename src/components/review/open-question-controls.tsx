'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
    return (
      <div className="space-y-4">
        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="default"
            onClick={() => setMode('resolve')}
            className="bg-[#0D9488] hover:bg-[#0F766E] text-white gap-1.5"
          >
            <CheckCircle size={14} />
            Resolve with decision
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMode('defer')}
            className="border-[#94A3B8] text-[#475569] hover:bg-[#F8FAFC] gap-1.5"
          >
            <Clock size={14} />
            Defer to later phase
          </Button>
          {questionStatus === 'resolved' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => submitReview('approve')}
              disabled={loading}
              className="border-[#14B8A6] text-[#0D9488] hover:bg-[#F0FDFA] gap-1.5"
            >
              <ThumbsUp size={14} />
              Confirm resolution
            </Button>
          )}
        </div>

        {/* Guidance */}
        <div className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          <span className="font-semibold">How this works:</span> Resolve provides a decision that the model author will incorporate into model.ts.
          Once updated, this question&apos;s status changes to &quot;resolved&quot; and other reviewers can confirm.
        </div>
      </div>
    )
  }

  const isResolve = mode === 'resolve'

  return (
    <div className="space-y-3">
      {/* Format guidance */}
      <div className={`rounded-lg px-3 py-2.5 text-sm leading-relaxed ${
        isResolve ? 'bg-[#F0FDFA] border border-[#14B8A6]/20' : 'bg-[#F8FAFC] border border-[#94A3B8]/20'
      }`}>
        <p className={`font-semibold mb-1.5 ${isResolve ? 'text-[#115E59]' : 'text-[#334155]'}`}>
          {isResolve ? 'Write the resolution' : 'Write the deferral reason'}
        </p>
        {isResolve ? (
          <div className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
            <p><span className="font-semibold">Decision:</span> State the answer clearly — e.g., &quot;Flat rate of $45 per HBL&quot;</p>
            <p><span className="font-semibold">Impact:</span> Note what this changes — e.g., &quot;Update booking entity fee_amount field description&quot;</p>
            <p><span className="font-semibold">Source:</span> Who decided this — e.g., &quot;Confirmed with PO in standup 2026-03-16&quot;</p>
          </div>
        ) : (
          <div className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
            <p><span className="font-semibold">Reason:</span> Why this can wait — e.g., &quot;Depends on payment gateway selection in Phase 4&quot;</p>
            <p><span className="font-semibold">Revisit:</span> When to come back — e.g., &quot;Before Phase 4 domain typing&quot;</p>
          </div>
        )}
      </div>

      {/* Input */}
      <Textarea
        placeholder={isResolve
          ? 'Decision: ...\nImpact: ...\nSource: ...'
          : 'Reason: ...\nRevisit: ...'
        }
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="min-h-[100px] text-sm font-mono"
      />

      {/* What happens next */}
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

      {/* Submit / Cancel */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={() => submitReview(isResolve ? 'resolve' : 'defer')}
          disabled={loading || !comment.trim()}
          className={isResolve
            ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white'
            : 'bg-[#475569] hover:bg-[#334155] text-white'
          }
        >
          {isResolve ? 'Submit Resolution' : 'Submit Deferral'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { setMode('idle'); setComment('') }}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
