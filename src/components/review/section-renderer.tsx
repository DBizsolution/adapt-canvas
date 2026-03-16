'use client'

import { Card } from '@/components/ui/card'
import { StatusBadge, WarnBadge, EdgeBadge } from './status-badge'
import { ReviewControls } from './review-controls'
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
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Review history</p>
      {reviews.map((r, i) => (
        <div key={i} className="text-sm flex gap-2 items-start">
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
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{actor.description}</p>
      <p className="text-xs"><span className="font-medium">Auth:</span> {actor.auth}</p>
      <div className="space-y-1">
        {actor.responsibilities.map(r => (
          <div key={r.id} className="flex gap-2 items-start text-sm py-1 border-b last:border-0">
            <code className="text-xs bg-muted px-1 py-0.5 rounded shrink-0">{r.id}</code>
            <span>{r.description}</span>
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
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{entity.description}</p>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Fields</p>
        {entity.key_fields.map(f => (
          <div key={f.name} className="flex gap-2 items-start text-sm py-1 border-b last:border-0">
            <code className="text-xs bg-muted px-1 py-0.5 rounded shrink-0">{f.name}</code>
            <code className="text-xs text-blue-600 shrink-0">{f.type}</code>
            <span className="text-muted-foreground">{f.description}</span>
            {f.warn && <WarnBadge text={f.warn} />}
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          Lifecycle: {entity.lifecycle.states.join(' → ')}
        </p>
        {entity.lifecycle.transitions.map((t, i) => (
          <div key={i} className="flex gap-2 items-center text-sm py-1 border-b last:border-0">
            <code className="text-xs bg-blue-50 text-blue-700 px-1 py-0.5 rounded">{t.from}</code>
            <span className="text-muted-foreground">→</span>
            <code className="text-xs bg-green-50 text-green-700 px-1 py-0.5 rounded">{t.to}</code>
            <span className="text-xs text-muted-foreground">{t.trigger}</span>
            {t.guard && <span className="text-xs text-muted-foreground italic">guard: {t.guard}</span>}
            {t.warn && <WarnBadge text={t.warn} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function JourneyRenderer({ journey }: { journey: Journey }) {
  return (
    <div className="space-y-3">
      <p className="text-xs"><span className="font-medium">Actor:</span> {journey.primary_actor}</p>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Preconditions</p>
        <ul className="text-sm list-disc list-inside space-y-0.5">
          {journey.preconditions.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>
      <div className="space-y-2">
        {journey.steps.map(s => (
          <div key={s.order} className="flex gap-3 py-2 border-b last:border-0">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
              {s.order}
            </div>
            <div>
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-sm text-muted-foreground">{s.detail}</p>
              {s.precondition && <p className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">Pre: {s.precondition}</p>}
              {s.warn && <WarnBadge text={s.warn} />}
              {s.edge && <EdgeBadge text={s.edge} />}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm"><span className="font-medium">Success:</span> {journey.success_outcome}</p>
    </div>
  )
}

function RuleRenderer({ rule }: { rule: BusinessRule }) {
  return (
    <div className="space-y-1">
      <p className="text-sm">{rule.description}</p>
      <div className="flex gap-2 items-center">
        <span className="text-xs text-muted-foreground">Applies to: {rule.applies_to.join(', ')}</span>
        <span className="text-xs text-muted-foreground">Source: {rule.source}</span>
      </div>
      {rule.warn && <WarnBadge text={rule.warn} />}
    </div>
  )
}

function ConstraintRenderer({ constraint }: { constraint: Constraint }) {
  return (
    <div className="space-y-1">
      <p className="text-sm">{constraint.constraint}</p>
      <code className="text-xs bg-muted px-1 py-0.5 rounded">{constraint.type}</code>
    </div>
  )
}

function OpenQuestionRenderer({ question }: { question: OpenQuestion }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{question.question}</p>
      <p className="text-sm text-muted-foreground">{question.reason}</p>
      <code className="text-xs bg-muted px-1 py-0.5 rounded">{question.status}</code>
      {question.resolution && <p className="text-sm text-green-700">{question.resolution}</p>}
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
  const displayId = 'name' in item ? (item as { name: string }).name : item.id

  return (
    <Card className="p-4" id={review.targetId}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-base">{displayId}</h3>
          <code className="text-xs text-muted-foreground">{review.targetId}</code>
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
