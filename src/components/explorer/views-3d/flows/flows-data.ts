import type { IntentModel, Journey } from '@/domain/intent-model/types'
import type { CardNode, ConnectionEdge, ItemType } from '../shared/types'
import { ICON_MAP } from '../shared/constants'

export type FlowsData = {
  stepCards: CardNode[]
  branchCards: CardNode[]
  edges: ConnectionEdge[]
  railPoints: [number, number, number][]
}

const STEP_SPACING = 6
const Z_AMPLITUDE = 1.5
const BRANCH_OFFSET_Y = 4
const BRANCH_OFFSET_X = 2.5

export function buildFlowsData(journey: Journey, model: IntentModel): FlowsData {
  const stepCards: CardNode[] = []
  const branchCards: CardNode[] = []
  const edges: ConnectionEdge[] = []
  const railPoints: [number, number, number][] = []

  // Build step cards along S-curved rail
  for (let i = 0; i < journey.steps.length; i++) {
    const step = journey.steps[i]
    const x = i * STEP_SPACING
    const z = Math.sin(i * 0.6) * Z_AMPLITUDE
    const pos: [number, number, number] = [x, 0, z]

    railPoints.push(pos)

    stepCards.push({
      id: `step-${step.order}`,
      name: `${step.order}. ${step.title}`,
      type: 'journey',
      stat: step.detail.slice(0, 50),
      icon: ICON_MAP.journey,
      size: 'medium',
      position: pos,
    })

    // Infer related items by text matching
    const text = `${step.title} ${step.detail} ${step.precondition || ''}`.toLowerCase()

    // Actors — primary actor always links to step 1, then text match
    let branchY = BRANCH_OFFSET_Y
    for (const actor of model.actors) {
      const isLinked = (i === 0 && actor.name.toLowerCase().includes(journey.primary_actor.toLowerCase()))
        || text.includes(actor.name.toLowerCase())
      if (isLinked) {
        const branchId = `branch-actor-${actor.id}-step-${step.order}`
        branchCards.push({
          id: branchId,
          name: actor.name,
          type: 'actor',
          stat: `${actor.responsibilities.length} resp.`,
          icon: ICON_MAP.actor,
          size: 'small',
          position: [x, branchY, z],
          deferred: actor.deferred,
        })
        edges.push({ id: `edge-${branchId}`, from: `step-${step.order}`, to: branchId })
        branchY += 3
      }
    }

    // Entities
    let branchYDown = -BRANCH_OFFSET_Y
    for (const entity of model.entities) {
      if (text.includes(entity.name.toLowerCase())) {
        const branchId = `branch-entity-${entity.id}-step-${step.order}`
        branchCards.push({
          id: branchId,
          name: entity.name,
          type: 'entity',
          stat: `${entity.key_fields.length} fields`,
          icon: ICON_MAP.entity,
          size: 'small',
          position: [x - BRANCH_OFFSET_X, branchYDown, z],
          deferred: entity.deferred,
        })
        edges.push({ id: `edge-${branchId}`, from: `step-${step.order}`, to: branchId })
        branchYDown -= 3
      }
    }

    // Rules
    let branchYRule = -BRANCH_OFFSET_Y
    for (const rule of model.business_rules) {
      const ruleText = `${rule.description} ${rule.applies_to.join(' ')}`.toLowerCase()
      if (text.includes(rule.id.toLowerCase()) || ruleText.includes(step.title.toLowerCase())) {
        const branchId = `branch-rule-${rule.id}-step-${step.order}`
        branchCards.push({
          id: branchId,
          name: rule.description.slice(0, 40),
          type: 'rule',
          stat: rule.id,
          icon: ICON_MAP.rule,
          size: 'small',
          position: [x + BRANCH_OFFSET_X, branchYRule, z],
        })
        edges.push({ id: `edge-${branchId}`, from: `step-${step.order}`, to: branchId })
        branchYRule -= 3
      }
    }
  }

  return { stepCards, branchCards, edges, railPoints }
}

// Idle state: all journeys as cards in a grid
export function buildFlowsIdleData(model: IntentModel): CardNode[] {
  const cols = 4
  return model.journeys.map((j, i) => ({
    id: j.id,
    name: j.name,
    type: 'journey' as ItemType,
    stat: `${j.steps.length} steps · ${j.primary_actor}`,
    icon: ICON_MAP.journey,
    size: 'medium' as const,
    deferred: j.deferred,
    position: [
      (i % cols) * 5 - (cols * 5) / 2 + 2.5,
      -Math.floor(i / cols) * 4 + 4,
      0,
    ] as [number, number, number],
  }))
}
