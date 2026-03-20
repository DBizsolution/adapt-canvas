'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type {
  Actor, Entity, Journey, BusinessRule, Constraint, OpenQuestion,
} from '@/domain/intent-model/types'
import type { SatelliteNodeData, EntityRelationships } from './explorer-types'
import { SATELLITE_COLORS, SATELLITE_LABELS, ENTITY_COLOR } from './explorer-types'

// --- Shared sub-components ---

function TypeBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ background: `${color}18`, color }}
    >
      {label}
    </span>
  )
}

function StateBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold"
      style={{ background: 'var(--bg-blue-subtle)', color: 'var(--accent-blue)', border: '1px solid rgba(0,129,242,0.15)' }}
    >
      {children}
    </span>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
      {children}
    </p>
  )
}

// --- Item renderers ---

function EntityDetail({ entity, relationships, onHighlightGroup }: {
  entity: Entity
  relationships?: EntityRelationships
  onHighlightGroup?: (type: SatelliteNodeData['itemType']) => void
}) {
  const [showTransitions, setShowTransitions] = useState(false)

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {entity.description}
      </p>

      {/* Fields table */}
      <div>
        <FieldLabel>Fields ({entity.key_fields.length})</FieldLabel>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
              <th className="py-1.5 pr-3 text-left font-medium" style={{ color: 'var(--text-muted)', width: '120px' }}>Name</th>
              <th className="py-1.5 pr-3 text-left font-medium" style={{ color: 'var(--text-muted)', width: '90px' }}>Type</th>
              <th className="py-1.5 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {entity.key_fields.map((f, i) => (
              <tr key={f.name} style={{ borderBottom: i < entity.key_fields.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                <td className="py-2 pr-3 align-top font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{f.name}</td>
                <td className="py-2 pr-3 align-top"><StateBadge>{f.type}</StateBadge></td>
                <td className="py-2 align-top text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lifecycle */}
      <div>
        <FieldLabel>Lifecycle ({entity.lifecycle.states.length} states)</FieldLabel>
        <div className="flex flex-wrap items-center gap-1 mb-2">
          {entity.lifecycle.states.map((s, i) => (
            <span key={s} className="flex items-center gap-1">
              <span
                className="rounded px-2 py-0.5 text-xs font-mono font-medium"
                style={{ background: 'var(--bg-gray-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}
              >
                {s}
              </span>
              {i < entity.lifecycle.states.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
            </span>
          ))}
        </div>

        {entity.lifecycle.transitions.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setShowTransitions(!showTransitions)}
              className="text-xs font-medium transition-colors duration-200"
              style={{ color: 'var(--accent-blue)' }}
            >
              {showTransitions ? '▾ Hide transitions' : '▸ Show transitions'}
            </button>

            {showTransitions && (
              <table className="mt-2 w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <th className="py-1.5 pr-2 text-left font-medium" style={{ color: 'var(--text-muted)', width: '80px' }}>From</th>
                    <th className="py-1.5 pr-2 text-left font-medium" style={{ color: 'var(--text-muted)', width: '80px' }}>To</th>
                    <th className="py-1.5 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Trigger</th>
                  </tr>
                </thead>
                <tbody>
                  {entity.lifecycle.transitions.map((t, i) => (
                    <tr key={i} style={{ borderBottom: i < entity.lifecycle.transitions.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                      <td className="py-2 pr-2 align-top font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{t.from}</td>
                      <td className="py-2 pr-2 align-top font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{t.to}</td>
                      <td className="py-2 align-top text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t.trigger}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* Related summary */}
      {relationships && (
        <div>
          <FieldLabel>Related</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {relationships.rules.length > 0 && (
              <button type="button" onClick={() => onHighlightGroup?.('business_rule')} className="text-xs font-medium px-2 py-1 rounded-md transition-colors duration-200 hover:opacity-80" style={{ background: '#F59E0B18', color: '#F59E0B' }}>
                {relationships.rules.length} rules
              </button>
            )}
            {relationships.journeys.length > 0 && (
              <button type="button" onClick={() => onHighlightGroup?.('journey')} className="text-xs font-medium px-2 py-1 rounded-md transition-colors duration-200 hover:opacity-80" style={{ background: '#10B98118', color: '#10B981' }}>
                {relationships.journeys.length} journeys
              </button>
            )}
            {relationships.actors.length > 0 && (
              <button type="button" onClick={() => onHighlightGroup?.('actor')} className="text-xs font-medium px-2 py-1 rounded-md transition-colors duration-200 hover:opacity-80" style={{ background: '#8B5CF618', color: '#8B5CF6' }}>
                {relationships.actors.length} actors
              </button>
            )}
            {relationships.constraints.length > 0 && (
              <button type="button" onClick={() => onHighlightGroup?.('constraint')} className="text-xs font-medium px-2 py-1 rounded-md transition-colors duration-200 hover:opacity-80" style={{ background: '#EF444418', color: '#EF4444' }}>
                {relationships.constraints.length} constraints
              </button>
            )}
            {relationships.openQuestions.length > 0 && (
              <button type="button" onClick={() => onHighlightGroup?.('open_question')} className="text-xs font-medium px-2 py-1 rounded-md transition-colors duration-200 hover:opacity-80" style={{ background: '#EC489918', color: '#EC4899' }}>
                {relationships.openQuestions.length} questions
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ActorDetail({ actor }: { actor: Actor }) {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{actor.description}</p>
      <div className="text-sm"><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Auth:</span> <span style={{ color: 'var(--text-secondary)' }}>{actor.auth}</span></div>
      <div>
        <FieldLabel>Responsibilities ({actor.responsibilities.length})</FieldLabel>
        {actor.responsibilities.map(r => (
          <div key={r.id} className="py-2 text-sm" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <span className="font-mono text-xs font-medium" style={{ color: 'var(--accent-blue)' }}>{r.id}</span>
            <p className="mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{r.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function JourneyDetail({ journey }: { journey: Journey }) {
  return (
    <div className="space-y-3">
      <div className="text-sm"><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Actor:</span> <span style={{ color: 'var(--text-secondary)' }}>{journey.primary_actor}</span></div>
      {journey.preconditions.length > 0 && (
        <div className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.06)', color: '#92400E', border: '1px solid rgba(245,158,11,0.15)' }}>
          <span className="font-semibold">Preconditions: </span>{journey.preconditions.join(' · ')}
        </div>
      )}
      <div>
        {journey.steps.map(s => (
          <div key={s.order} className="flex gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: 'var(--bg-blue-subtle)', color: 'var(--accent-blue)' }}>
              {s.order}
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</span>
              <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-sm"><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Outcome:</span> <span style={{ color: 'var(--text-secondary)' }}>{journey.success_outcome}</span></div>
    </div>
  )
}

function RuleDetail({ rule }: { rule: BusinessRule }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <StateBadge>{rule.id}</StateBadge>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{rule.source}</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{rule.description}</p>
      {rule.applies_to.length > 0 && (
        <div>
          <FieldLabel>Applies to</FieldLabel>
          <div className="flex flex-wrap gap-1">
            {rule.applies_to.map(ref => (
              <span key={ref} className="inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium" style={{ background: 'var(--bg-gray-subtle)', color: 'var(--text-secondary)' }}>
                {ref}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ConstraintDetail({ constraint }: { constraint: Constraint }) {
  return (
    <div className="space-y-3">
      <StateBadge>{constraint.type}</StateBadge>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{constraint.constraint}</p>
    </div>
  )
}

function OpenQuestionDetail({ question }: { question: OpenQuestion }) {
  return (
    <div className="space-y-3">
      <StateBadge>{question.status}</StateBadge>
      <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>{question.question}</p>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{question.reason}</p>
      {question.resolution && (
        <p className="text-sm px-2 py-1 rounded inline-block" style={{ background: 'rgba(37,186,59,0.08)', color: '#166534' }}>
          Resolution: {question.resolution}
        </p>
      )}
    </div>
  )
}

// --- Main panel component ---

type DetailPanelItem =
  | { type: 'entity'; entity: Entity; relationships?: EntityRelationships }
  | { type: 'satellite'; data: SatelliteNodeData }

type DetailPanelProps = {
  item: DetailPanelItem | null
  onClose: () => void
  onHighlightGroup?: (type: SatelliteNodeData['itemType']) => void
}

export function DetailPanel({ item, onClose, onHighlightGroup }: DetailPanelProps) {
  if (!item) return null

  const isEntity = item.type === 'entity'
  const color = isEntity ? ENTITY_COLOR : SATELLITE_COLORS[item.data.itemType]
  const typeLabel = isEntity ? 'Entity' : SATELLITE_LABELS[item.data.itemType]
  const name = isEntity ? item.entity.name : item.data.label

  return (
    <div
      className="absolute top-0 right-0 bottom-0 z-10 flex flex-col overflow-hidden"
      style={{
        width: 400,
        background: 'var(--bg-white)',
        borderLeft: '1px solid var(--border-default)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.06)',
        animation: 'slideInRight 200ms ease-out',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <TypeBadge label={typeLabel} color={color} />
          <h3 className="text-sm font-semibold truncate m-0" style={{ color: 'var(--text-primary)' }}>{name}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1.5 transition-colors duration-200 hover:bg-[var(--bg-gray-subtle)]"
        >
          <X size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 custom-scroll">
        {isEntity ? (
          <EntityDetail entity={item.entity} relationships={item.relationships} onHighlightGroup={onHighlightGroup} />
        ) : (
          (() => {
            const d = item.data
            switch (d.itemType) {
              case 'actor': return <ActorDetail actor={d.item as Actor} />
              case 'journey': return <JourneyDetail journey={d.item as Journey} />
              case 'business_rule': return <RuleDetail rule={d.item as BusinessRule} />
              case 'constraint': return <ConstraintDetail constraint={d.item as Constraint} />
              case 'open_question': return <OpenQuestionDetail question={d.item as OpenQuestion} />
            }
          })()
        )}
      </div>
    </div>
  )
}
