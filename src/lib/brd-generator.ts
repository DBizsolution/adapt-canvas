import type { IntentModel, OpenQuestion } from '@/domain/intent-model/types'
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { BRD_OUTPUT_PATH } from './paths'
import { projectConfig } from '@/lib/project-config'

export type DecisionMatch = {
  question: OpenQuestion
  matchedType: 'actor' | 'entity' | 'journey' | 'rule' | null
  matchedId: string | null
}

export function matchDecisionsToSections(model: IntentModel): DecisionMatch[] {
  const resolved = model.open_questions.filter(q => q.status === 'resolved')

  const actorIds = model.actors.map(a => a.id)
  const entityIds = model.entities.map(e => e.id)
  const journeyIds = model.journeys.map(j => j.id)

  return resolved.map(q => {
    const text = `${q.question} ${q.resolution ?? ''}`.toLowerCase()

    // Check actors
    for (const id of actorIds) {
      if (text.includes(id)) {
        return { question: q, matchedType: 'actor', matchedId: id }
      }
    }

    // Check entities
    for (const id of entityIds) {
      if (text.includes(id)) {
        return { question: q, matchedType: 'entity', matchedId: id }
      }
    }

    // Check journeys
    for (const id of journeyIds) {
      if (text.includes(id)) {
        return { question: q, matchedType: 'journey', matchedId: id }
      }
    }

    // Check business rules applies_to
    for (const rule of model.business_rules) {
      for (const ref of rule.applies_to) {
        if (text.includes(ref)) {
          return { question: q, matchedType: 'rule', matchedId: rule.id }
        }
      }
    }

    return { question: q, matchedType: null, matchedId: null }
  })
}

export function generateBRD(model: IntentModel): string {
  const decisions = matchDecisionsToSections(model)
  const lines: string[] = []

  function push(line: string) { lines.push(line) }
  function blank() { lines.push('') }

  function decisionsFor(type: DecisionMatch['matchedType'], id: string): string[] {
    return decisions
      .filter(d => d.matchedType === type && d.matchedId === id)
      .map(d => `> **Decision (${d.question.id}):** ${d.question.resolution}\n> *${d.question.reason}*`)
  }

  function renderWarn(warn?: string) {
    if (warn) push(`\n> ⚠️ **Warning:** ${warn}\n`)
  }

  function renderEdge(edge?: string) {
    if (edge) push(`\n> 🔄 **Edge case:** ${edge}\n`)
  }

  // --- Header ---
  push(`# ${model.meta.project} — Business Requirements Document`)
  blank()
  push(`**Version:** ${model.meta.version}`)
  push(`**Status:** ${model.meta.status}`)
  push(`**Last Updated:** ${model.meta.lastUpdated}`)
  push(`**Generated from Intent Model:** v${model.meta.version}`)
  blank()
  push('---')
  blank()

  // --- 1. Purpose & Scope ---
  push('## 1. Purpose & Scope')
  blank()
  push(projectConfig.brd.introText.replace('{project}', model.meta.project))
  blank()
  push(projectConfig.brd.scopeText)
  blank()

  // --- 2. Actors ---
  push('## 2. Actors — Who Is Involved')
  blank()
  for (const actor of model.actors) {
    push(`### ${actor.name}`)
    blank()
    push(actor.description)
    blank()
    push(`**Authentication:** ${actor.auth}`)
    blank()
    push('**Responsibilities:**')
    blank()
    for (const r of actor.responsibilities) {
      push(`- **${r.id}:** ${r.description}`)
      renderWarn(r.warn)
      renderEdge(r.edge)
      blank()
    }
    const actorDecisions = decisionsFor('actor', actor.id)
    for (const d of actorDecisions) { push(d); blank() }
  }

  // --- 3. Entities ---
  push('## 3. Entities — Key Data with Lifecycle')
  blank()
  for (const entity of model.entities) {
    push(`### ${entity.name}`)
    blank()
    push(entity.description)
    blank()

    if (entity.key_fields.length > 0) {
      push('**Key Fields:**')
      blank()
      push('| Field | Type | Description |')
      push('|-------|------|-------------|')
      for (const f of entity.key_fields) {
        push(`| ${f.name} | ${f.type} | ${f.description} |`)
        renderWarn(f.warn)
      }
      blank()
    }

    if (entity.lifecycle.states.length > 0) {
      push('**Lifecycle States:**')
      blank()
      for (const s of entity.lifecycle.states) {
        push(`- ${s}`)
      }
      blank()
      renderWarn(entity.lifecycle.warn)
    }

    if (entity.lifecycle.transitions.length > 0) {
      push('**Transitions:**')
      blank()
      push('| From | To | Trigger | Guard |')
      push('|------|-----|---------|-------|')
      for (const t of entity.lifecycle.transitions) {
        push(`| ${t.from} | ${t.to} | ${t.trigger} | ${t.guard ?? '—'} |`)
        renderWarn(t.warn)
      }
      blank()
    }

    const entityDecisions = decisionsFor('entity', entity.id)
    for (const d of entityDecisions) { push(d); blank() }
  }

  // --- 4. User Journeys ---
  push('## 4. User Journeys')
  blank()
  const actorGroups = new Map<string, typeof model.journeys>()
  for (const j of model.journeys) {
    const group = actorGroups.get(j.primary_actor) ?? []
    group.push(j)
    actorGroups.set(j.primary_actor, group)
  }

  for (const [actorId, journeys] of actorGroups) {
    const actor = model.actors.find(a => a.id === actorId)
    push(`### ${actor?.name ?? actorId} Journeys`)
    blank()

    for (const journey of journeys) {
      push(`#### ${journey.name}`)
      blank()
      renderWarn(journey.warn)

      if (journey.preconditions.length > 0) {
        push('**Preconditions:**')
        blank()
        for (const p of journey.preconditions) {
          push(`- ${p}`)
        }
        blank()
      }

      push('**Steps:**')
      blank()
      for (const step of journey.steps) {
        const pre = step.precondition ? ` *(Requires: ${step.precondition})*` : ''
        push(`${step.order}. **${step.title}** — ${step.detail}${pre}`)
        renderWarn(step.warn)
        renderEdge(step.edge)
        blank()
      }

      push(`**Success Outcome:** ${journey.success_outcome}`)
      blank()

      const journeyDecisions = decisionsFor('journey', journey.id)
      for (const d of journeyDecisions) { push(d); blank() }
    }
  }

  // --- 5. Business Rules ---
  push('## 5. Business Rules')
  blank()
  for (const rule of model.business_rules) {
    push(`**${rule.id}:** ${rule.description}`)
    blank()
    push(`- *Applies to:* ${rule.applies_to.join(', ')}`)
    push(`- *Source:* ${rule.source}`)
    renderWarn(rule.warn)
    blank()
  }

  // --- 6. Constraints ---
  push('## 6. Constraints')
  blank()
  const constraintGroups = new Map<string, typeof model.constraints>()
  for (const c of model.constraints) {
    const group = constraintGroups.get(c.type) ?? []
    group.push(c)
    constraintGroups.set(c.type, group)
  }

  for (const [type, constraints] of constraintGroups) {
    push(`### ${type.charAt(0).toUpperCase() + type.slice(1)}`)
    blank()
    for (const c of constraints) {
      push(`- **${c.id}:** ${c.constraint}`)
      blank()
    }
  }

  // --- 7. Open Questions & Decision Log ---
  push('## 7. Open Questions & Decision Log')
  blank()

  const openQs = model.open_questions.filter(q => q.status === 'open' || q.status === 'deferred')
  const resolvedQs = model.open_questions.filter(q => q.status === 'resolved')

  if (openQs.length > 0) {
    push('### 7a. Open Questions')
    blank()
    for (const q of openQs) {
      const badge = q.status === 'deferred' ? ' `DEFERRED`' : ' `OPEN`'
      push(`**${q.id}:**${badge} ${q.question}`)
      push(`- *Reason:* ${q.reason}`)
      blank()
    }
  }

  if (resolvedQs.length > 0) {
    push('### 7b. Decision Log')
    blank()
    for (const q of resolvedQs) {
      push(`**${q.id}:** ${q.question}`)
      push(`- *Resolution:* ${q.resolution}`)
      blank()
    }
  }

  push('---')
  blank()
  push(`*Generated from Intent Model v${model.meta.version} on ${new Date().toISOString().split('T')[0]}*`)

  return lines.join('\n')
}

export async function writeBRD(model: IntentModel): Promise<void> {
  const markdown = generateBRD(model)
  await mkdir(dirname(BRD_OUTPUT_PATH), { recursive: true })
  await writeFile(BRD_OUTPUT_PATH, markdown, 'utf-8')
}
