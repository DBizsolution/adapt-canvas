import { getCurrentModel } from '@/lib/model-store'
import { matchDecisionsToSections } from '@/lib/brd-generator'
import type { DecisionMatch } from '@/lib/brd-generator'
import type { OpenQuestion } from '@/domain/intent-model/types'
import { BRDExportButtons } from './brd-export-buttons'

export const dynamic = 'force-dynamic'

function DecisionCallout({ question }: { question: OpenQuestion }) {
  return (
    <div className="my-3 rounded-lg border-l-4 border-blue-400 bg-blue-50/50 px-4 py-3">
      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Decision ({question.id})
      </p>
      <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{question.resolution}</p>
      <p className="mt-1 text-xs italic" style={{ color: 'var(--text-muted)' }}>{question.reason}</p>
    </div>
  )
}

function WarnCallout({ text }: { text: string }) {
  return (
    <div className="my-2 rounded-lg border-l-4 border-amber-400 bg-amber-50/50 px-4 py-2.5">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>⚠️ {text}</p>
    </div>
  )
}

function EdgeCallout({ text }: { text: string }) {
  return (
    <div className="my-2 rounded-lg border-l-4 border-slate-300 bg-slate-50/50 px-4 py-2.5">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>🔄 {text}</p>
    </div>
  )
}

function SectionDivider() {
  return <hr className="my-8 border-t" style={{ borderColor: 'var(--border-default)' }} />
}

function decisionsFor(decisions: DecisionMatch[], type: DecisionMatch['matchedType'], id: string) {
  return decisions
    .filter(d => d.matchedType === type && d.matchedId === id)
    .map(d => <DecisionCallout key={d.question.id} question={d.question} />)
}

export default async function BRDPage() {
  const model = await getCurrentModel()
  const decisions = matchDecisionsToSections(model)

  const journeysByActor = new Map<string, typeof model.journeys>()
  for (const j of model.journeys) {
    const group = journeysByActor.get(j.primary_actor) ?? []
    group.push(j)
    journeysByActor.set(j.primary_actor, group)
  }

  const constraintsByType = new Map<string, typeof model.constraints>()
  for (const c of model.constraints) {
    const group = constraintsByType.get(c.type) ?? []
    group.push(c)
    constraintsByType.set(c.type, group)
  }

  const openQs = model.open_questions.filter(q => q.status === 'open' || q.status === 'deferred')
  const resolvedQs = model.open_questions.filter(q => q.status === 'resolved')

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header toolbar */}
      <div
        className="flex h-[54px] shrink-0 items-center justify-between border-b px-6 print:hidden"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <div>
          <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            Business Requirements Document
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            v{model.meta.version} — {model.meta.status}
          </p>
        </div>
        <BRDExportButtons version={model.meta.version} />
      </div>

      {/* Scrollable BRD content */}
      <div className="flex-1 overflow-y-auto custom-scroll print:overflow-visible">
        <div className="mx-auto max-w-[780px] px-10 py-8 print:max-w-none print:px-0">

          {/* Header */}
          <h1 className="text-2xl font-bold" style={{ color: 'var(--acfs-navy)' }}>
            {model.meta.project}
          </h1>
          <h2 className="mt-1 text-lg font-normal" style={{ color: 'var(--text-secondary)' }}>
            Business Requirements Document
          </h2>
          <div className="mt-4 flex gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span>Version {model.meta.version}</span>
            <span>Status: {model.meta.status}</span>
            <span>Updated: {model.meta.lastUpdated}</span>
          </div>

          <SectionDivider />

          {/* 1. Purpose & Scope */}
          <section className="print:break-before-auto">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--acfs-navy)' }}>
              1. Purpose & Scope
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The {model.meta.project} is a web-based system for managing container pickup bookings at ACFS facilities.
              It enables logistics service providers to view shipments, delegate pickup authority, book pickup slots,
              manage documentation, and make payments — with ACFS staff overseeing operations, slot configuration, and verification.
            </p>
          </section>

          <SectionDivider />

          {/* 2. Actors */}
          <section className="print:break-before-page">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--acfs-navy)' }}>
              2. Actors — Who Is Involved
            </h2>
            {model.actors.map(actor => (
              <div key={actor.id} className="mb-8">
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {actor.name}
                </h3>
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{actor.description}</p>
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                  <strong>Authentication:</strong> {actor.auth}
                </p>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Responsibilities:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {actor.responsibilities.map(r => (
                    <li key={r.id}>
                      {r.description}
                      {r.warn && <WarnCallout text={r.warn} />}
                      {r.edge && <EdgeCallout text={r.edge} />}
                    </li>
                  ))}
                </ol>
                {decisionsFor(decisions, 'actor', actor.id)}
              </div>
            ))}
          </section>

          <SectionDivider />

          {/* 3. Entities */}
          <section className="print:break-before-page">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--acfs-navy)' }}>
              3. Entities — Key Data with Lifecycle
            </h2>
            {model.entities.map(entity => (
              <div key={entity.id} className="mb-8">
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {entity.name}
                </h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{entity.description}</p>

                {entity.key_fields.length > 0 && (
                  <>
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Key Fields:</p>
                    <table className="mb-4 w-full text-sm border-collapse">
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-default)' }}>
                          <th className="py-2 pr-4 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Field</th>
                          <th className="py-2 pr-4 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Type</th>
                          <th className="py-2 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entity.key_fields.map(f => (
                          <tr key={f.name} style={{ borderBottom: '1px solid var(--border-default)' }}>
                            <td className="py-2 pr-4 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{f.name}</td>
                            <td className="py-2 pr-4" style={{ color: 'var(--text-muted)' }}>{f.type}</td>
                            <td className="py-2" style={{ color: 'var(--text-secondary)' }}>
                              {f.description}
                              {f.warn && <WarnCallout text={f.warn} />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {entity.lifecycle.states.length > 0 && (
                  <>
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Lifecycle States:</p>
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {entity.lifecycle.states.map(s => (
                        <span key={s} className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'var(--bg-card-gray)', color: 'var(--text-secondary)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                    {entity.lifecycle.warn && <WarnCallout text={entity.lifecycle.warn} />}
                  </>
                )}

                {entity.lifecycle.transitions.length > 0 && (
                  <>
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Transitions:</p>
                    <table className="mb-4 w-full text-sm border-collapse">
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-default)' }}>
                          <th className="py-2 pr-4 text-left font-medium" style={{ color: 'var(--text-muted)' }}>From</th>
                          <th className="py-2 pr-4 text-left font-medium" style={{ color: 'var(--text-muted)' }}>To</th>
                          <th className="py-2 pr-4 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Trigger</th>
                          <th className="py-2 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Guard</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entity.lifecycle.transitions.map((t, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-default)' }}>
                            <td className="py-2 pr-4" style={{ color: 'var(--text-secondary)' }}>{t.from}</td>
                            <td className="py-2 pr-4" style={{ color: 'var(--text-secondary)' }}>{t.to}</td>
                            <td className="py-2 pr-4" style={{ color: 'var(--text-secondary)' }}>{t.trigger}</td>
                            <td className="py-2" style={{ color: 'var(--text-muted)' }}>{t.guard ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {decisionsFor(decisions, 'entity', entity.id)}
              </div>
            ))}
          </section>

          <SectionDivider />

          {/* 4. User Journeys */}
          <section className="print:break-before-page">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--acfs-navy)' }}>
              4. User Journeys
            </h2>
            {Array.from(journeysByActor.entries()).map(([actorId, journeys]) => {
              const actor = model.actors.find(a => a.id === actorId)
              return (
                <div key={actorId} className="mb-8">
                  <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    {actor?.name ?? actorId} Journeys
                  </h3>
                  {journeys.map(journey => (
                    <div key={journey.id} className="mb-6 pl-4" style={{ borderLeft: '2px solid var(--border-default)' }}>
                      <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {journey.name}
                      </h4>
                      {journey.warn && <WarnCallout text={journey.warn} />}

                      {journey.preconditions.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Preconditions:</p>
                          <ul className="list-disc list-inside text-sm space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {journey.preconditions.map((p, i) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
                      )}

                      <ol className="list-decimal list-inside space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {journey.steps.map(step => (
                          <li key={step.order}>
                            <strong>{step.title}</strong> — {step.detail}
                            {step.precondition && (
                              <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}> (Requires: {step.precondition})</span>
                            )}
                            {step.warn && <WarnCallout text={step.warn} />}
                            {step.edge && <EdgeCallout text={step.edge} />}
                          </li>
                        ))}
                      </ol>

                      <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <strong>Outcome:</strong> {journey.success_outcome}
                      </p>

                      {decisionsFor(decisions, 'journey', journey.id)}
                    </div>
                  ))}
                </div>
              )
            })}
          </section>

          <SectionDivider />

          {/* 5. Business Rules */}
          <section className="print:break-before-page">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--acfs-navy)' }}>
              5. Business Rules
            </h2>
            <div className="space-y-4">
              {model.business_rules.map(rule => (
                <div key={rule.id} className="rounded-lg p-4" style={{ background: 'var(--bg-card-gray)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {rule.id}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{rule.description}</p>
                  <div className="mt-2 flex gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>Applies to: {rule.applies_to.join(', ')}</span>
                    <span>Source: {rule.source}</span>
                  </div>
                  {rule.warn && <WarnCallout text={rule.warn} />}
                </div>
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* 6. Constraints */}
          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--acfs-navy)' }}>
              6. Constraints
            </h2>
            {Array.from(constraintsByType.entries()).map(([type, constraints]) => (
              <div key={type} className="mb-4">
                <h3 className="text-sm font-semibold mb-2 capitalize" style={{ color: 'var(--text-primary)' }}>
                  {type}
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {constraints.map(c => (
                    <li key={c.id}><strong>{c.id}:</strong> {c.constraint}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <SectionDivider />

          {/* 7. Open Questions & Decision Log */}
          <section className="print:break-before-page">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--acfs-navy)' }}>
              7. Open Questions & Decision Log
            </h2>

            {openQs.length > 0 && (
              <>
                <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  7a. Open Questions
                </h3>
                <div className="space-y-3 mb-8">
                  {openQs.map(q => (
                    <div key={q.id} className="rounded-lg border p-4" style={{ borderColor: 'var(--border-default)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{q.id}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          q.status === 'deferred'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {q.status}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{q.question}</p>
                      <p className="mt-1 text-xs italic" style={{ color: 'var(--text-muted)' }}>{q.reason}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {resolvedQs.length > 0 && (
              <>
                <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  7b. Decision Log
                </h3>
                <div className="space-y-3">
                  {resolvedQs.map(q => (
                    <div key={q.id} className="rounded-lg p-4" style={{ background: 'var(--bg-card-gray)' }}>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{q.id}</span>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{q.question}</p>
                      <p className="mt-1 text-sm font-medium" style={{ color: 'var(--accent-blue)' }}>{q.resolution}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Print footer */}
          <div className="hidden print:block mt-12 pt-4 border-t text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Generated from Intent Model v{model.meta.version} on {new Date().toISOString().split('T')[0]}
          </div>

        </div>
      </div>
    </div>
  )
}
