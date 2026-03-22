'use client'

import { useState } from 'react'
import type { IntentModel } from '@/domain/intent-model/types'

const SECTION_COLORS = {
  actors: { bg: '#8B5CF618', color: '#8B5CF6', label: 'Actor' },
  entities: { bg: '#0081F218', color: '#0081F2', label: 'Entity' },
  journeys: { bg: '#10B98118', color: '#10B981', label: 'Journey' },
  business_rules: { bg: '#F59E0B18', color: '#F59E0B', label: 'Rule' },
  constraints: { bg: '#EF444418', color: '#EF4444', label: 'Constraint' },
  open_questions: { bg: '#EC489918', color: '#EC4899', label: 'Question' },
} as const

type SectionKey = keyof typeof SECTION_COLORS

function SectionBadge({ section }: { section: SectionKey }) {
  const { bg, color, label } = SECTION_COLORS[section]
  return (
    <span
      className="inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  )
}

function IdBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block font-mono text-xs font-medium px-1.5 py-0.5 rounded"
      style={{ background: 'var(--bg-blue-subtle)', color: 'var(--accent-blue)' }}
    >
      {children}
    </span>
  )
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1.5">
      <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-muted)', width: 100 }}>{label}</span>
      <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{value}</span>
    </div>
  )
}

function SectionHeading({ title, count, section }: { title: string; count: number; section: SectionKey }) {
  const { color } = SECTION_COLORS[section]
  return (
    <div className="flex items-center gap-3 mb-4 pt-2">
      <div className="h-5 w-1 rounded-full" style={{ background: color }} />
      <h2 className="text-lg font-semibold m-0" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-gray-subtle)', color: 'var(--text-muted)' }}>
        {count}
      </span>
    </div>
  )
}

function Card({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div
      id={id}
      className="mb-3 rounded-xl p-4"
      style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      {children}
    </div>
  )
}

function StatePill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded px-2 py-0.5 text-xs font-mono font-medium"
      style={{ background: 'var(--bg-gray-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}
    >
      {children}
    </span>
  )
}

export function ModelReader({ model }: { model: IntentModel }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="h-full overflow-y-auto custom-scroll" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold m-0" style={{ color: 'var(--acfs-navy)' }}>
            {model.meta.project}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-medium" style={{ color: 'var(--accent-blue)' }}>
              v{model.meta.version}
            </span>
            <span className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>
              {model.meta.status}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Updated {model.meta.lastUpdated}
            </span>
          </div>
        </div>

        {/* Table of contents */}
        <div className="mb-8 rounded-xl p-4" style={{ background: 'var(--bg-white)', border: '1px solid var(--border-default)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Contents</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['actors', 'Actors', model.actors.length],
              ['entities', 'Entities', model.entities.filter(e => !e.is_integration).length],
              ['integrations', 'Integrations', model.entities.filter(e => e.is_integration).length],
              ['journeys', 'Journeys', model.journeys.length],
              ['business_rules', 'Business Rules', model.business_rules.length],
              ['constraints', 'Constraints', model.constraints.length],
              ['open_questions', 'Open Questions', model.open_questions.length],
            ] as const).map(([key, label, count]) => (
              <a
                key={key}
                href={`#section-${key}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-colors duration-200"
                style={{ color: 'var(--text-primary)', background: 'var(--bg-gray-subtle)' }}
              >
                <SectionBadge section={key} />
                {label}
                <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>{count}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Actors */}
        <div id="section-actors" className="mb-10">
          <SectionHeading title="Actors" count={model.actors.length} section="actors" />
          {model.actors.map(actor => (
            <Card key={actor.id} id={`actor-${actor.id}`}>
              <div className="flex items-center gap-2 mb-2">
                <SectionBadge section="actors" />
                <h3 className="text-sm font-bold m-0" style={{ color: 'var(--text-primary)' }}>{actor.name}</h3>
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{actor.description}</p>
              <FieldRow label="Auth" value={actor.auth} />
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                  Responsibilities ({actor.responsibilities.length})
                </p>
                {actor.responsibilities.map(r => (
                  <div key={r.id} className="py-2" style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <IdBadge>{r.id}</IdBadge>
                    <p className="text-sm leading-relaxed mt-1 mb-0" style={{ color: 'var(--text-secondary)' }}>{r.description}</p>
                    {r.warn && <p className="text-xs mt-1 mb-0 px-2 py-1 rounded" style={{ background: 'rgba(245,158,11,0.08)', color: '#92400E' }}>{r.warn}</p>}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Entities */}
        <div id="section-entities" className="mb-10">
          <SectionHeading title="Entities" count={model.entities.filter(e => !e.is_integration).length} section="entities" />
          {model.entities.filter(e => !e.is_integration).map(entity => {
            const isExpanded = expandedSections.has(entity.id)
            return (
              <Card key={entity.id} id={`entity-${entity.id}`}>
                <div className="flex items-center gap-2 mb-2">
                  <SectionBadge section="entities" />
                  <h3 className="text-sm font-bold m-0" style={{ color: 'var(--text-primary)' }}>{entity.name}</h3>
                  <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                    {entity.key_fields.length} fields · {entity.lifecycle.states.length} states
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{entity.description}</p>

                <button
                  type="button"
                  onClick={() => toggle(entity.id)}
                  className="text-xs font-medium mb-2"
                  style={{ color: 'var(--accent-blue)' }}
                >
                  {isExpanded ? '▾ Hide details' : '▸ Show fields & lifecycle'}
                </button>

                {isExpanded && (
                  <div className="mt-2 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Fields</p>
                      {entity.key_fields.map(f => (
                        <div key={f.name} className="py-2" style={{ borderBottom: '1px solid var(--border-default)' }}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-blue-subtle)', color: 'var(--accent-blue)' }}>{f.type}</span>
                          </div>
                          <p className="text-xs leading-relaxed m-0" style={{ color: 'var(--text-secondary)' }}>{f.description}</p>
                          {f.warn && <p className="text-xs mt-1 mb-0 px-2 py-1 rounded" style={{ background: 'rgba(245,158,11,0.08)', color: '#92400E' }}>{f.warn}</p>}
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Lifecycle</p>
                      <div className="flex flex-wrap items-center gap-1 mb-3">
                        {entity.lifecycle.states.map((s, i) => (
                          <span key={s} className="flex items-center gap-1">
                            <StatePill>{s}</StatePill>
                            {i < entity.lifecycle.states.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                          </span>
                        ))}
                      </div>
                      {entity.lifecycle.transitions.length > 0 && (
                        <div className="space-y-2">
                          {entity.lifecycle.transitions.map((t, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs py-1.5" style={{ borderBottom: '1px solid var(--border-default)' }}>
                              <StatePill>{t.from}</StatePill>
                              <span style={{ color: 'var(--text-muted)' }}>→</span>
                              <StatePill>{t.to}</StatePill>
                              <span className="flex-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t.trigger}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Integrations */}
        <div id="section-integrations" className="mb-10">
          <SectionHeading title="Integrations" count={model.entities.filter(e => e.is_integration).length} section="entities" />
          {model.entities.filter(e => e.is_integration).map(entity => (
            <Card key={entity.id} id={`entity-${entity.id}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-gray-subtle)', color: 'var(--text-muted)' }}>Integration</span>
                <h3 className="text-sm font-bold m-0" style={{ color: 'var(--text-primary)' }}>{entity.name}</h3>
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{entity.description}</p>
              {entity.key_fields.map(f => (
                <div key={f.name} className="py-1.5" style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
                  </div>
                  <p className="text-xs leading-relaxed m-0" style={{ color: 'var(--text-secondary)' }}>{f.description}</p>
                  {f.warn && <p className="text-xs mt-1 mb-0 px-2 py-1 rounded" style={{ background: 'rgba(245,158,11,0.08)', color: '#92400E' }}>{f.warn}</p>}
                </div>
              ))}
            </Card>
          ))}
        </div>

        {/* Journeys */}
        <div id="section-journeys" className="mb-10">
          <SectionHeading title="Journeys" count={model.journeys.length} section="journeys" />
          {model.journeys.map(journey => (
            <Card key={journey.id} id={`journey-${journey.id}`}>
              <div className="flex items-center gap-2 mb-2">
                <SectionBadge section="journeys" />
                <h3 className="text-sm font-bold m-0" style={{ color: 'var(--text-primary)' }}>{journey.name}</h3>
              </div>
              <FieldRow label="Actor" value={journey.primary_actor} />
              {journey.preconditions.length > 0 && (
                <div className="text-xs px-3 py-2 rounded-lg my-2" style={{ background: 'rgba(245,158,11,0.06)', color: '#92400E', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <span className="font-semibold">Preconditions: </span>{journey.preconditions.join(' · ')}
                </div>
              )}
              <div className="mt-3">
                {journey.steps.map(s => (
                  <div key={s.order} className="flex gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                      style={{ background: 'var(--bg-blue-subtle)', color: 'var(--accent-blue)' }}
                    >
                      {s.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</span>
                      <p className="text-xs leading-relaxed mt-0.5 mb-0" style={{ color: 'var(--text-secondary)' }}>{s.detail}</p>
                      {s.warn && <p className="text-xs mt-1 mb-0 px-2 py-1 rounded" style={{ background: 'rgba(245,158,11,0.08)', color: '#92400E' }}>{s.warn}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm">
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Outcome: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{journey.success_outcome}</span>
              </div>
              {journey.warn && <p className="text-xs mt-2 mb-0 px-2 py-1 rounded" style={{ background: 'rgba(245,158,11,0.08)', color: '#92400E' }}>{journey.warn}</p>}
            </Card>
          ))}
        </div>

        {/* Business Rules */}
        <div id="section-business_rules" className="mb-10">
          <SectionHeading title="Business Rules" count={model.business_rules.length} section="business_rules" />
          {model.business_rules.map(rule => (
            <Card key={rule.id} id={`rule-${rule.id}`}>
              <div className="flex items-center gap-2 mb-2">
                <IdBadge>{rule.id}</IdBadge>
                <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{rule.source}</span>
              </div>
              <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>{rule.description}</p>
              {rule.applies_to.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {rule.applies_to.map(ref => (
                    <span key={ref} className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-gray-subtle)', color: 'var(--text-muted)' }}>{ref}</span>
                  ))}
                </div>
              )}
              {rule.warn && <p className="text-xs mt-2 mb-0 px-2 py-1 rounded" style={{ background: 'rgba(245,158,11,0.08)', color: '#92400E' }}>{rule.warn}</p>}
            </Card>
          ))}
        </div>

        {/* Constraints */}
        <div id="section-constraints" className="mb-10">
          <SectionHeading title="Constraints" count={model.constraints.length} section="constraints" />
          {model.constraints.map(constraint => (
            <Card key={constraint.id} id={`constraint-${constraint.id}`}>
              <div className="flex items-center gap-2 mb-2">
                <IdBadge>{constraint.id}</IdBadge>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-gray-subtle)', color: 'var(--text-muted)' }}>{constraint.type}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{constraint.constraint}</p>
            </Card>
          ))}
        </div>

        {/* Open Questions */}
        <div id="section-open_questions" className="mb-10">
          <SectionHeading title="Open Questions" count={model.open_questions.length} section="open_questions" />
          {model.open_questions.map(q => {
            const statusColor = q.status === 'resolved' ? '#10B981' : q.status === 'deferred' ? '#F59E0B' : '#EF4444'
            return (
              <Card key={q.id} id={`question-${q.id}`}>
                <div className="flex items-center gap-2 mb-2">
                  <IdBadge>{q.id}</IdBadge>
                  <span
                    className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                    style={{ background: `${statusColor}18`, color: statusColor }}
                  >
                    {q.status}
                  </span>
                </div>
                <p className="text-sm font-semibold leading-relaxed mb-1" style={{ color: 'var(--text-primary)' }}>{q.question}</p>
                <p className="text-sm leading-relaxed mb-0" style={{ color: 'var(--text-secondary)' }}>{q.reason}</p>
                {q.resolution && (
                  <p className="text-xs mt-2 mb-0 px-2 py-1.5 rounded" style={{ background: 'rgba(37,186,59,0.08)', color: '#166534' }}>
                    <span className="font-semibold">Resolution: </span>{q.resolution}
                  </p>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
