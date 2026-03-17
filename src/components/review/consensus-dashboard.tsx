'use client'

import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import type { ConsensusStatus, Reviewer, SectionType } from '@/domain/intent-model/types'
import type { EnrichedSectionReview } from '@/lib/review-utils'
import { SECTION_TYPE_TO_MODEL_KEY, SECTION_TYPE_TO_URL_PARAM } from '@/domain/intent-model/types'

type ConsensusDashboardProps = {
  consensus: ConsensusStatus
  sections: EnrichedSectionReview[]
  reviewers: Reviewer[]
}

const sectionTypeLabels: Record<SectionType, string> = {
  actor: 'Actors',
  entity: 'Entities',
  journey: 'Journeys',
  business_rule: 'Business Rules',
  constraint: 'Constraints',
  open_question: 'Open Questions',
}

export function ConsensusDashboard({ consensus, sections, reviewers }: ConsensusDashboardProps) {
  const sectionTypes = Object.keys(sectionTypeLabels) as SectionType[]
  const pct = consensus.totalSections > 0 ? Math.round((consensus.approved / consensus.totalSections) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Progress summary — one line */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Progress value={pct} className="h-1.5" />
        </div>
        <div className="flex items-center gap-3 text-xs font-medium shrink-0">
          <span style={{ color: 'var(--accent-green)' }}>{consensus.approved} approved</span>
          {consensus.disputed > 0 && <span style={{ color: '#E11D48' }}>{consensus.disputed} disputed</span>}
          {consensus.revised > 0 && <span style={{ color: 'var(--accent-blue)' }}>{consensus.revised} revised</span>}
          <span style={{ color: 'var(--text-muted)' }}>{consensus.pending} pending</span>
        </div>
      </div>

      {/* Sections — simple list */}
      <div className="space-y-2">
        {sectionTypes.map(type => {
          const typeSections = sections.filter(s => s.targetType === type)
          const approved = typeSections.filter(s => s.effectiveStatus === 'approved').length
          const disputed = typeSections.filter(s => s.effectiveStatus === 'disputed').length
          const total = typeSections.length
          if (total === 0) return null
          const sectionPct = total > 0 ? Math.round((approved / total) * 100) : 0

          return (
            <Link key={type} href={`/review/${SECTION_TYPE_TO_URL_PARAM[type]}`}>
              <div
                className="flex items-center gap-4 rounded-lg px-4 py-3.5 transition-all duration-200 hover:shadow-md"
                style={{
                  background: 'var(--bg-white)',
                  border: '1px solid var(--border-default)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <span className="text-sm font-semibold w-[140px] shrink-0" style={{ color: 'var(--acfs-navy)' }}>
                  {sectionTypeLabels[type]}
                </span>
                <div className="flex-1">
                  <Progress value={sectionPct} className="h-1" />
                </div>
                <span className="text-xs font-medium w-[60px] text-right" style={{ color: 'var(--text-muted)' }}>
                  {approved}/{total}
                </span>
                {disputed > 0 && (
                  <span className="text-xs font-medium" style={{ color: '#E11D48' }}>{disputed} disputed</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Reviewers — compact */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2" style={{ borderTop: '1px solid var(--border-default)' }}>
        {reviewers.map(r => {
          const relevantSections = sections.filter(s => {
            const modelKey = SECTION_TYPE_TO_MODEL_KEY[s.targetType] as string
            return r.focus.includes(modelKey)
          })
          const reviewed = relevantSections.filter(s =>
            s.reviews.some(rev => rev.reviewerId === r.id)
          ).length
          const total = relevantSections.length

          return (
            <span key={r.id} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span>
              {' '}{reviewed}/{total}
            </span>
          )
        })}
      </div>
    </div>
  )
}
