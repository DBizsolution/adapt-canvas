'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { StatusBadge, WarnIndicator, EdgeIndicator } from './status-badge'
import { ReviewControls } from './review-controls'
import { OpenQuestionControls } from './open-question-controls'
import { HelpTip } from './help-tip'
import { AbbrText } from './abbr-text'
import type { EnrichedSectionReview } from '@/lib/review-utils'
import type {
  Actor, Entity, Journey, BusinessRule, Constraint, OpenQuestion, SectionType, Review
} from '@/domain/intent-model/types'


type SectionRendererProps = {
  item: Actor | Entity | Journey | BusinessRule | Constraint | OpenQuestion
  type: SectionType
  review: EnrichedSectionReview
  currentReviewerId: string | null
}

const sectionTypeExplanations: Record<SectionType, string> = {
  actor: 'A person or role that interacts with the system. Each actor has specific responsibilities.',
  entity: 'A core data object in the system that has fields and goes through lifecycle stages.',
  journey: 'A step-by-step flow showing how an actor completes a task in the system.',
  business_rule: 'A rule the system must enforce — something that must always be true.',
  constraint: 'A limit on the system — capacity, pricing, access, or compliance boundaries.',
  open_question: 'Something that still needs to be decided or clarified before building.',
}

/* ---------- Shared sub-components ---------- */

function FieldRow({ label, value, warn, edge }: { label: string; value: string; warn?: string; edge?: string }) {
  return (
    <div className="flex gap-3 py-2 items-start last:border-0" style={{ borderBottom: '1px solid var(--border-default)' }}>
      <span className="text-sm font-semibold min-w-[160px] shrink-0" style={{ color: 'var(--text-primary)' }}>{label}</span>
      <span className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
        <AbbrText text={value} />
        {warn && <WarnIndicator text={warn} />}
        {edge && <EdgeIndicator text={edge} />}
      </span>
    </div>
  )
}

function StateBadge({ children }: { children: React.ReactNode; variant?: string }) {
  return (
    <span
      className="inline-block whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold"
      style={{ background: 'var(--bg-blue-subtle)', color: 'var(--accent-blue)', border: '1px solid rgba(0,129,242,0.15)' }}
    >
      {children}
    </span>
  )
}

function ReviewHistory({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null
  return (
    <div className="mt-4 space-y-2 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Review history</p>
      {reviews.map((r, i) => (
        <div key={i} className="text-sm flex gap-2 items-start">
          <span className={r.status === 'approved' ? 'text-[#0D9488]' : 'text-[#E11D48]'}>
            {r.status === 'approved' ? '✓' : '✗'}
          </span>
          <div>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.reviewerId}</span>
            <span style={{ color: 'var(--text-muted)' }}> — {new Date(r.timestamp).toLocaleDateString()}</span>
            {r.comment && <p className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- Section renderers ---------- */

function ActorRenderer({ actor }: { actor: Actor }) {
  return (
    <div>
      <FieldRow label="Description" value={actor.description} />
      <FieldRow label="Auth" value={actor.auth} />
      {actor.responsibilities.map(r => (
        <FieldRow key={r.id} label={r.id} value={r.description} warn={r.warn} edge={r.edge} />
      ))}
    </div>
  )
}

function EntityRenderer({ entity }: { entity: Entity }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Fields</p>
        {entity.key_fields.map(f => (
          <div key={f.name} className="flex gap-3 py-2 items-start last:border-0" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <span className="text-sm font-semibold min-w-[160px] shrink-0" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
            <StateBadge>{f.type}</StateBadge>
            <span className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
              <AbbrText text={f.description} />
              {f.warn && <WarnIndicator text={f.warn} />}
            </span>
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Lifecycle</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {entity.lifecycle.states.map((s, i) => (
            <span key={s} className="flex items-center gap-1.5">
              <StateBadge>{s}</StateBadge>
              {i < entity.lifecycle.states.length - 1 && <span className="text-sm" style={{ color: 'var(--text-muted)' }}>→</span>}
            </span>
          ))}
        </div>
        {entity.lifecycle.transitions.map((t, i) => (
          <div key={i} className="grid grid-cols-[1fr_30px_1fr_1.5fr_1.5fr] gap-2 py-2 items-center last:border-0" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <StateBadge>{t.from}</StateBadge>
            <span className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>→</span>
            <StateBadge>{t.to}</StateBadge>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <AbbrText text={t.trigger} />
              {t.warn && <WarnIndicator text={t.warn} />}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-muted)', fontStyle: t.guard ? 'normal' : 'italic' }}>
              {t.guard || 'None'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function JourneyRenderer({ journey }: { journey: Journey }) {
  return (
    <div className="space-y-4">
      <FieldRow label="Primary actor" value={journey.primary_actor} />

      {journey.preconditions.length > 0 && (
        <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid rgba(245,158,11,0.2)' }}>
          <span className="font-semibold">Preconditions: </span>
          {journey.preconditions.join(' · ')}
        </div>
      )}

      <div>
        {journey.steps.map(s => (
          <div key={s.order} className="flex gap-3 py-3 last:border-0" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'var(--bg-blue-subtle)', color: 'var(--accent-blue)' }}
            >
              {s.order}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</span>
                {s.warn && <WarnIndicator text={s.warn} />}
                {s.edge && <EdgeIndicator text={s.edge} />}
                <HelpTip text={`Step ${s.order}: ${s.detail}`} />
              </div>
              <p className="text-sm leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}><AbbrText text={s.detail} /></p>
              {s.precondition && (
                <span className="inline-block text-xs px-2 py-0.5 rounded mt-1" style={{ background: '#FFFBEB', color: '#92400E' }}>
                  Precondition: {s.precondition}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <FieldRow label="Success outcome" value={journey.success_outcome} />
    </div>
  )
}

function RuleRenderer({ rule }: { rule: BusinessRule }) {
  return (
    <div className="grid grid-cols-[70px_1fr_120px] gap-3 items-start">
      <StateBadge>{rule.id}</StateBadge>
      <span className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        <AbbrText text={rule.description} />
        {rule.warn && <WarnIndicator text={rule.warn} />}
      </span>
      <span className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>{rule.source}</span>
    </div>
  )
}

function ConstraintRenderer({ constraint }: { constraint: Constraint }) {
  return (
    <div className="flex gap-3 items-start">
      <StateBadge>{constraint.type}</StateBadge>
      <span className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-primary)' }}><AbbrText text={constraint.constraint} /></span>
      <HelpTip text={`${constraint.type} constraint: ${constraint.constraint}`} />
    </div>
  )
}

function OpenQuestionRenderer({ question }: { question: OpenQuestion }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <StateBadge>{question.status}</StateBadge>
        <span className="text-sm font-semibold flex-1" style={{ color: 'var(--text-primary)' }}><AbbrText text={question.question} /></span>
        <HelpTip text={`This question is ${question.status}. ${question.reason}`} />
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}><AbbrText text={question.reason} /></p>
      {question.resolution && (
        <p className="text-sm px-2 py-1 rounded inline-block" style={{ background: 'rgba(37,186,59,0.08)', color: '#166534' }}>
          Resolution: {question.resolution}
        </p>
      )}
    </div>
  )
}

function renderItem(item: SectionRendererProps['item'], type: SectionType) {
  switch (type) {
    case 'actor': return <ActorRenderer actor={item as Actor} />
    case 'entity': return <EntityRenderer entity={item as Entity} />
    case 'journey': return <JourneyRenderer journey={item as Journey} />
    case 'business_rule': return <RuleRenderer rule={item as BusinessRule} />
    case 'constraint': return <ConstraintRenderer constraint={item as Constraint} />
    case 'open_question': return <OpenQuestionRenderer question={item as OpenQuestion} />
  }
}

export function SectionCard({ item, type, review, currentReviewerId }: SectionRendererProps) {
  const [isOpen, setIsOpen] = useState(false)
  const displayId = 'name' in item ? (item as { name: string }).name : item.id
  const description = 'description' in item ? (item as { description: string }).description : ''
  return (
    <div
      id={review.targetId}
      className="mb-3 overflow-hidden rounded-xl transition-shadow"
      style={{ background: 'var(--bg-white)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-subtle)' }}
    >
      {/* Clickable header */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen) } }}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition-colors duration-200"
        style={{ background: isOpen ? 'var(--bg-card-gray)' : 'var(--bg-white)', borderBottom: isOpen ? '1px solid var(--border-default)' : 'none' }}
      >
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
          <h3 className="m-0 text-sm font-bold" style={{ color: 'var(--acfs-navy)' }}>{displayId}</h3>
          <HelpTip text={`${sectionTypeExplanations[type]} — ${description || displayId}`} />
        </div>
        <StatusBadge status={review.effectiveStatus} />
      </div>

      {/* Collapsible body */}
      {isOpen && (
        <div className="p-4">
          {renderItem(item, type)}
          <ReviewHistory reviews={review.reviews} />
          {currentReviewerId && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
              {type === 'open_question' ? (
                <OpenQuestionControls
                  section={review}
                  currentReviewerId={currentReviewerId}
                  questionStatus={(item as OpenQuestion).status}
                />
              ) : (
                <ReviewControls section={review} currentReviewerId={currentReviewerId} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
