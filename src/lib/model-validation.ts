import type { IntentModel, SectionType } from '@/domain/intent-model/types'
import { SECTION_TYPE_TO_MODEL_KEY } from '@/domain/intent-model/types'

export type ValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
  model: IntentModel // potentially patched (annotation restoration)
}

export function validateModel(
  proposed: IntentModel,
  original: IntentModel,
  prompt: string,
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const model = structuredClone(proposed)

  // 1. Referential integrity
  const actorIds = new Set(model.actors.map(a => a.id))
  const entityIds = new Set(model.entities.map(e => e.id))
  const allRefIds = new Set([...actorIds, ...entityIds])

  for (const journey of model.journeys) {
    if (!actorIds.has(journey.primary_actor)) {
      errors.push(`Journey "${journey.name}" references actor "${journey.primary_actor}" which does not exist`)
    }
  }

  for (const rule of model.business_rules) {
    for (const ref of rule.applies_to) {
      if (!allRefIds.has(ref)) {
        errors.push(`Business rule "${rule.id}" references "${ref}" in applies_to which does not exist`)
      }
    }
  }

  for (const actor of model.actors) {
    for (const resp of actor.responsibilities) {
      if (!resp.id.startsWith(`${actor.id}:`)) {
        errors.push(`Responsibility "${resp.id}" should start with "${actor.id}:" to match parent actor`)
      }
    }
  }

  // 2. ID uniqueness
  const allIds: string[] = []
  const sectionTypes = Object.keys(SECTION_TYPE_TO_MODEL_KEY) as SectionType[]
  for (const st of sectionTypes) {
    const key = SECTION_TYPE_TO_MODEL_KEY[st]
    const items = model[key] as Array<{ id: string }>
    for (const item of items) {
      allIds.push(item.id)
    }
  }
  const respIds: string[] = []
  for (const actor of model.actors) {
    for (const resp of actor.responsibilities) {
      respIds.push(resp.id)
    }
  }

  const idCounts = new Map<string, number>()
  for (const id of allIds) {
    idCounts.set(id, (idCounts.get(id) ?? 0) + 1)
  }
  for (const [id, count] of idCounts) {
    if (count > 1) errors.push(`Duplicate item ID: "${id}"`)
  }

  const respIdCounts = new Map<string, number>()
  for (const id of respIds) {
    respIdCounts.set(id, (respIdCounts.get(id) ?? 0) + 1)
  }
  for (const [id, count] of respIdCounts) {
    if (count > 1) errors.push(`Duplicate responsibility ID: "${id}"`)
  }

  // 3. Item count guard
  const promptLower = prompt.toLowerCase()
  const mentionsDeletion = ['remove', 'delete', 'replace'].some(w => promptLower.includes(w))

  for (const st of sectionTypes) {
    const key = SECTION_TYPE_TO_MODEL_KEY[st]
    const oldCount = (original[key] as Array<unknown>).length
    const newCount = (model[key] as Array<unknown>).length
    if (newCount < oldCount && !mentionsDeletion) {
      warnings.push(`${String(key)} went from ${oldCount} to ${newCount} items — was this intended?`)
    }
  }

  // 4. Annotation preservation
  for (const st of sectionTypes) {
    const key = SECTION_TYPE_TO_MODEL_KEY[st]
    const oldItems = original[key] as Array<Record<string, unknown>>
    const newItems = model[key] as Array<Record<string, unknown>>
    const oldMap = new Map(oldItems.map(i => [i.id, i]))

    const mentionsAnnotations = ['warn', 'edge'].some(w => promptLower.includes(w))

    for (const newItem of newItems) {
      const oldItem = oldMap.get(newItem.id as string)
      if (!oldItem || mentionsAnnotations) continue

      // Restore warn/edge on top-level item
      if (oldItem.warn && !newItem.warn) newItem.warn = oldItem.warn
      if (oldItem.edge && !newItem.edge) newItem.edge = oldItem.edge

      // Restore on nested items (responsibilities, key_fields, steps, transitions)
      for (const field of ['responsibilities', 'key_fields', 'steps', 'transitions']) {
        const oldNested = oldItem[field] as Array<Record<string, unknown>> | undefined
        const newNested = newItem[field] as Array<Record<string, unknown>> | undefined
        if (!oldNested || !newNested) continue

        const oldNestedMap = new Map(oldNested.map(n => [n.id ?? n.order ?? n.name, n]))
        for (const newN of newNested) {
          const key2 = newN.id ?? newN.order ?? newN.name
          const oldN = oldNestedMap.get(key2)
          if (!oldN) continue
          if (oldN.warn && !newN.warn) newN.warn = oldN.warn
          if (oldN.edge && !newN.edge) newN.edge = oldN.edge
        }
      }
    }
  }

  // 5. Lifecycle consistency (entities only)
  for (const entity of model.entities) {
    const stateSet = new Set(entity.lifecycle.states)
    for (const t of entity.lifecycle.transitions) {
      if (!stateSet.has(t.from)) {
        errors.push(`Entity "${entity.name}" transition from "${t.from}" references unknown state`)
      }
      if (!stateSet.has(t.to)) {
        errors.push(`Entity "${entity.name}" transition to "${t.to}" references unknown state`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    model,
  }
}
