'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { StatusBadge, WarnIndicator, EdgeIndicator } from './status-badge'
import { ReviewControls } from './review-controls'
import { OpenQuestionControls } from './open-question-controls'
import { HelpTip } from './help-tip'
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
    <div className="flex gap-2 py-1.5 border-b border-[#F1F5F9] items-start last:border-0">
      <span className="text-xs font-semibold text-[#334155] min-w-[160px] shrink-0">{label}</span>
      <span className="text-xs text-[#475569] leading-relaxed flex-1">
        {value}
        {warn && <WarnIndicator text={warn} />}
        {edge && <EdgeIndicator text={edge} />}
      </span>
    </div>
  )
}

function StateBadge({ children, variant }: { children: React.ReactNode; variant: keyof typeof C }) {
  const colors = C[variant]
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${colors.bg} ${colors.text} border ${colors.border} whitespace-nowrap`}>
      {children}
    </span>
  )
}

function ReviewHistory({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null
  return (
    <div className="mt-4 space-y-2 pt-4 border-t border-[#F1F5F9]">
      <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Review history</p>
      {reviews.map((r, i) => (
        <div key={i} className="text-xs flex gap-2 items-start">
          <span className={r.status === 'approved' ? 'text-[#0D9488]' : 'text-[#E11D48]'}>
            {r.status === 'approved' ? '✓' : '✗'}
          </span>
          <div>
            <span className="font-semibold text-[#334155]">{r.reviewerId}</span>
            <span className="text-[#94A3B8]"> — {new Date(r.timestamp).toLocaleDateString()}</span>
            {r.comment && <p className="text-[#64748B] mt-0.5">{r.comment}</p>}
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
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-2">Fields</p>
        {entity.key_fields.map(f => (
          <div key={f.name} className="flex gap-2 py-1.5 border-b border-[#F1F5F9] items-start last:border-0">
            <span className="text-xs font-semibold text-[#334155] min-w-[160px] shrink-0">{f.name}</span>
            <StateBadge variant="blue">{f.type}</StateBadge>
            <span className="text-xs text-[#475569] leading-relaxed flex-1">
              {f.description}
              {f.warn && <WarnIndicator text={f.warn} />}
            </span>
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-2">Lifecycle</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {entity.lifecycle.states.map((s, i) => (
            <span key={s} className="flex items-center gap-1.5">
              <StateBadge variant="slate">{s}</StateBadge>
              {i < entity.lifecycle.states.length - 1 && <span className="text-[#94A3B8] text-sm">→</span>}
            </span>
          ))}
        </div>
        {entity.lifecycle.transitions.map((t, i) => (
          <div key={i} className="grid grid-cols-[1fr_30px_1fr_1.5fr_1.5fr] gap-1.5 py-2 border-b border-[#F1F5F9] items-center last:border-0">
            <StateBadge variant="blue">{t.from}</StateBadge>
            <span className="text-center text-[#94A3B8] text-sm">→</span>
            <StateBadge variant="green">{t.to}</StateBadge>
            <span className="text-[11px] text-[#475569]">
              {t.trigger}
              {t.warn && <WarnIndicator text={t.warn} />}
            </span>
            <span className="text-[11px] text-[#64748B]" style={{ fontStyle: t.guard ? 'normal' : 'italic' }}>
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
        <div className="bg-[#FFFBEB] text-[#92400E] text-xs px-3 py-2 rounded-lg border border-[#F59E0B]/20">
          <span className="font-semibold">Preconditions: </span>
          {journey.preconditions.join(' · ')}
        </div>
      )}

      <div>
        {journey.steps.map(s => (
          <div key={s.order} className="flex gap-3 py-2.5 border-b border-[#F1F5F9] last:border-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 ${
                s.edge
                  ? 'bg-[#FFF1F2] border-[#E11D48] text-[#9F1239]'
                  : s.warn
                    ? 'bg-[#FFFBEB] border-[#F59E0B] text-[#92400E]'
                    : 'bg-[#EFF6FF] border-[#3B82F6] text-[#1E40AF]'
              }`}
            >
              {s.order}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-[#1E293B]">{s.title}</span>
                {s.warn && <WarnIndicator text={s.warn} />}
                {s.edge && <EdgeIndicator text={s.edge} />}
                <HelpTip text={`Step ${s.order}: ${s.detail}`} />
              </div>
              <p className="text-xs text-[#475569] leading-relaxed mt-0.5">{s.detail}</p>
              {s.precondition && (
                <span className="inline-block text-[11px] text-[#92400E] bg-[#FFFBEB] px-2 py-0.5 rounded mt-1">
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
    <div className="grid grid-cols-[60px_1fr_120px] gap-2 items-start">
      <StateBadge variant={rule.warn ? 'amber' : 'blue'}>{rule.id}</StateBadge>
      <span className="text-xs text-[#334155] leading-relaxed">
        {rule.description}
        {rule.warn && <WarnIndicator text={rule.warn} />}
      </span>
      <span className="text-[10px] text-[#94A3B8] text-right">{rule.source}</span>
    </div>
  )
}

function ConstraintRenderer({ constraint }: { constraint: Constraint }) {
  return (
    <div className="flex gap-2 items-start">
      <StateBadge variant="orange">{constraint.type}</StateBadge>
      <span className="text-xs text-[#334155] leading-relaxed flex-1">{constraint.constraint}</span>
      <HelpTip text={`${constraint.type} constraint: ${constraint.constraint}`} />
    </div>
  )
}

function OpenQuestionRenderer({ question }: { question: OpenQuestion }) {
  const statusVariant = question.status === 'resolved' ? 'green' : question.status === 'deferred' ? 'amber' : 'purple'
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <StateBadge variant={statusVariant}>{question.status}</StateBadge>
        <span className="text-xs font-semibold text-[#1E293B] flex-1">{question.question}</span>
        <HelpTip text={`This question is ${question.status}. ${question.reason}`} />
      </div>
      <p className="text-xs text-[#64748B] leading-relaxed">{question.reason}</p>
      {question.resolution && (
        <p className="text-xs text-[#166534] bg-[#F0FDF4] px-2 py-1 rounded inline-block">
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
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors duration-200"
        style={{ background: isOpen ? 'var(--bg-card-gray)' : 'var(--bg-white)', borderBottom: isOpen ? '1px solid var(--border-default)' : 'none' }}
      >
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
          <h3 className="m-0 text-sm font-bold" style={{ color: 'var(--acfs-navy)' }}>{displayId}</h3>
          <HelpTip text={`${sectionTypeExplanations[type]} — ${description || displayId}`} />
        </div>
        <StatusBadge status={review.effectiveStatus} />
      </button>

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
