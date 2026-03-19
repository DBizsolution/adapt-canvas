import type { IntentModel, OpenQuestion } from '@/domain/intent-model/types'

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
