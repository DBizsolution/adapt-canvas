'use client'

import { useState } from 'react'
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

type StatusFilter = 'all' | 'approved' | 'disputed' | 'pending' | 'revised'

const filters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'pending', label: 'Pending Consensus' },
  { value: 'revised', label: 'Revised' },
]

export function ConsensusDashboard({ consensus, sections, reviewers }: ConsensusDashboardProps) {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const sectionTypes = Object.keys(sectionTypeLabels) as SectionType[]

  const filteredSections = filter === 'all'
    ? sections
    : sections.filter(s => s.effectiveStatus === filter)

  const pct = consensus.totalSections > 0 ? Math.round((consensus.approved / consensus.totalSections) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div
        className="inline-flex rounded-lg p-0.5"
        style={{ background: 'var(--bg-gray-subtle)', border: '1px solid var(--border-light)' }}
      >
        {filters.map(f => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className="rounded-md px-3 py-1 text-xs font-medium transition-all duration-200"
            style={{
              background: filter === f.value ? 'var(--bg-white)' : 'transparent',
              color: filter === f.value ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: filter === f.value ? 'var(--shadow-subtle)' : 'none',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--bg-white)', border: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Consensus</h2>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              background: consensus.ready ? 'rgba(37,186,59,0.08)' : 'var(--bg-gray-subtle)',
              color: consensus.ready ? 'var(--accent-green)' : 'var(--text-muted)',
            }}
          >
            {consensus.ready ? 'Ready for Phase 3' : `${pct}% complete`}
          </span>
        </div>
        <Progress value={pct} className="h-1.5 mb-4" />
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent-green)' }}>{consensus.approved}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Approved</p>
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: '#E11D48' }}>{consensus.disputed}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Disputed</p>
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent-blue)' }}>{consensus.revised}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Revised</p>
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-muted)' }}>{consensus.pending}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pending</p>
          </div>
        </div>
      </div>

      {/* Section breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {sectionTypes.map(type => {
          const typeSections = filteredSections.filter(s => s.targetType === type)
          const approved = typeSections.filter(s => s.effectiveStatus === 'approved').length
          const total = typeSections.length
          if (total === 0) return null

          return (
            <Link key={type} href={`/review/${SECTION_TYPE_TO_URL_PARAM[type]}`}>
              <div
                className="rounded-xl p-4 transition-all duration-200 hover:shadow-md"
                style={{ background: 'var(--bg-white)', border: '1px solid var(--border-default)' }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--acfs-navy)' }}>{sectionTypeLabels[type]}</h3>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{approved}/{total}</span>
                </div>
                <Progress value={total > 0 ? (approved / total) * 100 : 0} className="h-1" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Reviewers */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--bg-white)', border: '1px solid var(--border-default)' }}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Reviewers</h2>
        <div className="space-y-3">
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
              <div key={r.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.role.replace('_', ' ')} — {r.focus.join(', ')}</p>
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{reviewed}/{total} reviewed</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
