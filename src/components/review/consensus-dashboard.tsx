'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
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

export function ConsensusDashboard({ consensus, sections, reviewers }: ConsensusDashboardProps) {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const sectionTypes = Object.keys(sectionTypeLabels) as SectionType[]

  const filteredSections = filter === 'all'
    ? sections
    : sections.filter(s => s.effectiveStatus === filter)

  const filters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'approved', label: 'Approved' },
    { value: 'disputed', label: 'Disputed' },
    { value: 'pending', label: 'Pending' },
    { value: 'revised', label: 'Revised' },
  ]

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex gap-1">
        {filters.map(f => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Overall readiness */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Consensus Status</h2>
          <span className={`text-base font-medium px-3 py-1 rounded-full ${
            consensus.ready
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {consensus.ready ? 'Ready for Phase 3' : 'In Progress'}
          </span>
        </div>
        <Progress value={consensus.totalSections > 0 ? (consensus.approved / consensus.totalSections) * 100 : 0} className="h-2 mb-3" />
        <div className="grid grid-cols-4 gap-4 text-center text-base">
          <div>
            <p className="text-3xl font-bold text-green-600">{consensus.approved}</p>
            <p className="text-base text-muted-foreground">Approved</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-amber-600">{consensus.disputed}</p>
            <p className="text-base text-muted-foreground">Disputed</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">{consensus.revised}</p>
            <p className="text-base text-muted-foreground">Revised</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-400">{consensus.pending}</p>
            <p className="text-base text-muted-foreground">Pending</p>
          </div>
        </div>
      </Card>

      {/* Per section type breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {sectionTypes.map(type => {
          const typeSections = filteredSections.filter(s => s.targetType === type)
          const approved = typeSections.filter(s => s.effectiveStatus === 'approved').length
          const total = typeSections.length
          if (total === 0) return null

          return (
            <Link key={type} href={`/review/${SECTION_TYPE_TO_URL_PARAM[type]}`}>
              <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-medium">{sectionTypeLabels[type]}</h3>
                  <span className="text-sm text-muted-foreground">{approved}/{total}</span>
                </div>
                <Progress value={total > 0 ? (approved / total) * 100 : 0} className="h-1.5" />
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Reviewer status */}
      <Card className="p-8">
        <h2 className="text-xl font-semibold mb-4">Reviewers</h2>
        <div className="space-y-4">
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
                  <p className="text-base font-medium">{r.name}</p>
                  <p className="text-sm text-muted-foreground">{r.role.replace('_', ' ')} — {r.focus.join(', ')}</p>
                </div>
                <span className="text-base text-muted-foreground">{reviewed}/{total} reviewed</span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
