'use client'

import { Card } from '@/components/ui/card'
import { StatusBadge, WarnBadge, EdgeBadge } from './status-badge'
import { ReviewControls } from './review-controls'
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

function ReviewHistory({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null
  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Review history</p>
      {reviews.map((r, i) => (
        <div key={i} className="text-base flex gap-2 items-start">
          <span className={r.status === 'approved' ? 'text-green-600' : 'text-amber-600'}>
            {r.status === 'approved' ? '✓' : '✗'}
          </span>
          <div>
            <span className="font-medium">{r.reviewerId}</span>
            <span className="text-muted-foreground"> — {new Date(r.timestamp).toLocaleDateString()}</span>
            {r.comment && <p className="text-muted-foreground mt-0.5">{r.comment}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

function ActorRenderer({ actor }: { actor: Actor }) {
  return (
    <div className="space-y-3">
      <p className="text-base text-muted-foreground">{actor.description}</p>
      <p className="text-sm"><span className="font-medium">Auth:</span> {actor.auth}</p>
      <div className="space-y-1">
        {actor.responsibilities.map(r => (
          <div key={r.id} className="flex gap-2 items-start text-base py-2 border-b last:border-0">
            <code className="text-sm bg-muted px-1 py-0.5 rounded shrink-0">{r.id}</code>
            <span className="flex-1">{r.description}</span>
            <HelpTip text={`Responsibility ${r.id}: ${r.description}`} />
            {r.warn && <WarnBadge text={r.warn} />}
            {r.edge && <EdgeBadge text={r.edge} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function EntityRenderer({ entity }: { entity: Entity }) {
  return (
    <div className="space-y-4">
      <p className="text-base text-muted-foreground">{entity.description}</p>
      <div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Fields</p>
        {entity.key_fields.map(f => (
          <div key={f.name} className="flex gap-2 items-start text-base py-2 border-b last:border-0">
            <code className="text-sm bg-muted px-1 py-0.5 rounded shrink-0">{f.name}</code>
            <code className="text-sm text-blue-600 shrink-0">{f.type}</code>
            <span className="text-muted-foreground flex-1">{f.description}</span>
            <HelpTip text={`Field "${f.name}" (${f.type}): ${f.description}`} />
            {f.warn && <WarnBadge text={f.warn} />}
          </div>
        ))}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Lifecycle: {entity.lifecycle.states.join(' → ')}
        </p>
        {entity.lifecycle.transitions.map((t, i) => (
          <div key={i} className="flex gap-2 items-center text-base py-2 border-b last:border-0">
            <code className="text-sm bg-blue-50 text-blue-700 px-1 py-0.5 rounded">{t.from}</code>
            <span className="text-muted-foreground">→</span>
            <code className="text-sm bg-green-50 text-green-700 px-1 py-0.5 rounded">{t.to}</code>
            <span className="text-sm text-muted-foreground flex-1">{t.trigger}</span>
            <HelpTip text={`When "${t.trigger}" happens, moves from ${t.from} to ${t.to}.${t.guard ? ` Only if: ${t.guard}` : ''}`} />
            {t.guard && <span className="text-sm text-muted-foreground italic">guard: {t.guard}</span>}
            {t.warn && <WarnBadge text={t.warn} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function JourneyRenderer({ journey }: { journey: Journey }) {
  return (
    <div className="space-y-4">
      <p className="text-sm"><span className="font-medium">Actor:</span> {journey.primary_actor}</p>
      <div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Preconditions</p>
        <ul className="text-base list-disc list-inside space-y-1">
          {journey.preconditions.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>
      <div className="space-y-3">
        {journey.steps.map(s => (
          <div key={s.order} className="flex gap-3 py-3 border-b last:border-0">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
              {s.order}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-base font-medium">{s.title}</p>
                <HelpTip text={`Step ${s.order}: ${s.detail}`} />
              </div>
              <p className="text-base text-muted-foreground">{s.detail}</p>
              {s.precondition && <p className="text-sm text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">Pre: {s.precondition}</p>}
              {s.warn && <WarnBadge text={s.warn} />}
              {s.edge && <EdgeBadge text={s.edge} />}
            </div>
          </div>
        ))}
      </div>
      <p className="text-base"><span className="font-medium">Success:</span> {journey.success_outcome}</p>
    </div>
  )
}

function RuleRenderer({ rule }: { rule: BusinessRule }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <p className="text-base flex-1">{rule.description}</p>
        <HelpTip text={`Business rule ${rule.id}: ${rule.description}. Source: ${rule.source}`} />
      </div>
      <div className="flex gap-2 items-center">
        <span className="text-sm text-muted-foreground">Applies to: {rule.applies_to.join(', ')}</span>
        <span className="text-sm text-muted-foreground">Source: {rule.source}</span>
      </div>
      {rule.warn && <WarnBadge text={rule.warn} />}
    </div>
  )
}

function ConstraintRenderer({ constraint }: { constraint: Constraint }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <p className="text-base flex-1">{constraint.constraint}</p>
        <HelpTip text={`${constraint.type} constraint: ${constraint.constraint}`} />
      </div>
      <code className="text-sm bg-muted px-1 py-0.5 rounded">{constraint.type}</code>
    </div>
  )
}

function OpenQuestionRenderer({ question }: { question: OpenQuestion }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <p className="text-base font-medium flex-1">{question.question}</p>
        <HelpTip text={`This question is ${question.status}. ${question.reason}`} />
      </div>
      <p className="text-base text-muted-foreground">{question.reason}</p>
      <code className="text-sm bg-muted px-1 py-0.5 rounded">{question.status}</code>
      {question.resolution && <p className="text-base text-green-700">{question.resolution}</p>}
    </div>
  )
}

const sectionTypeExplanations: Record<SectionType, string> = {
  actor: 'A person or role that interacts with the system. Each actor has specific responsibilities.',
  entity: 'A core data object in the system that has fields and goes through lifecycle stages.',
  journey: 'A step-by-step flow showing how an actor completes a task in the system.',
  business_rule: 'A rule the system must enforce — something that must always be true.',
  constraint: 'A limit on the system — capacity, pricing, access, or compliance boundaries.',
  open_question: 'Something that still needs to be decided or clarified before building.',
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
  const displayId = 'name' in item ? (item as { name: string }).name : item.id
  const description = 'description' in item ? (item as { description: string }).description : ''

  return (
    <Card className="p-6" id={review.targetId}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="font-semibold text-lg">{displayId}</h3>
            <code className="text-sm text-muted-foreground">{review.targetId}</code>
          </div>
          <HelpTip text={`${sectionTypeExplanations[type]} — ${description || displayId}`} />
        </div>
        <StatusBadge status={review.effectiveStatus} />
      </div>
      {renderItem(item, type)}
      <ReviewHistory reviews={review.reviews} />
      {currentReviewerId && (
        <ReviewControls section={review} currentReviewerId={currentReviewerId} />
      )}
    </Card>
  )
}
