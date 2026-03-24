import type { IntentModel, Entity } from '@/domain/intent-model/types'
import type { CardNode, CardSize, ConnectionEdge, ItemType } from '../shared/types'
import { ICON_MAP } from '../shared/constants'

export type AnatomyData = {
  mainCard: CardNode
  lifecycleCards: CardNode[]
  lifecycleEdges: ConnectionEdge[]
  orbitingCards: CardNode[]
  orbitingEdges: ConnectionEdge[]
}

const ORBIT_ZONES: { type: ItemType; angle: number; radius: number }[] = [
  { type: 'actor', angle: Math.PI * 0.75, radius: 8 },      // upper-left
  { type: 'journey', angle: 0, radius: 9 },                  // right
  { type: 'rule', angle: -Math.PI * 0.35, radius: 8 },       // below-right
  { type: 'entity', angle: Math.PI, radius: 7 },             // left (other entities)
]

export function buildAnatomyData(entity: Entity, model: IntentModel): AnatomyData {
  const mainId = `main-${entity.id}`

  // Main panel at origin
  const mainCard: CardNode = {
    id: mainId,
    name: entity.name,
    type: 'entity',
    stat: `${entity.key_fields.length} fields · ${entity.lifecycle.states.length} states${entity.is_integration ? ' · Integration' : ''}`,
    icon: ICON_MAP.entity,
    size: 'large',
    position: [0, 1, 0],
    deferred: entity.deferred,
  }

  // Lifecycle rail below main panel
  const lifecycleCards: CardNode[] = entity.lifecycle.states.map((state, i) => ({
    id: `lc-${state}`,
    name: state,
    type: 'entity' as ItemType,
    stat: '',
    icon: ICON_MAP.entity,
    size: 'small',
    position: [i * 3.5 - (entity.lifecycle.states.length - 1) * 1.75, -4, 0],
  }))

  // Lifecycle edges from transitions
  const lifecycleEdges: ConnectionEdge[] = entity.lifecycle.transitions.map(t => ({
    id: `lc-edge-${t.from}-${t.to}`,
    from: `lc-${t.from}`,
    to: `lc-${t.to}`,
    visible: true,
    color: '#0081F2',
  }))

  // Orbiting cards — find related items
  const orbitingCards: CardNode[] = []
  const orbitingEdges: ConnectionEdge[] = []

  const nameLC = entity.name.toLowerCase()

  // Related actors
  const relatedActors = model.actors.filter(a =>
    a.responsibilities.some(r =>
      r.description.toLowerCase().includes(nameLC)
    )
  )
  relatedActors.forEach((a, i) => {
    const zone = ORBIT_ZONES.find(z => z.type === 'actor')!
    const angle = zone.angle + (i * 0.4 - relatedActors.length * 0.2)
    const id = `orbit-actor-${a.id}`
    orbitingCards.push({
      id,
      name: a.name,
      type: 'actor',
      stat: `${a.responsibilities.length} resp.`,
      icon: ICON_MAP.actor,
      size: 'small',
      position: [Math.cos(angle) * zone.radius, Math.sin(angle) * zone.radius + 1, 0],
      deferred: a.deferred,
    })
    orbitingEdges.push({ id: `orbit-edge-${id}`, from: mainId, to: id, visible: true })
  })

  // Related journeys
  const relatedJourneys = model.journeys.filter(j =>
    j.steps.some(s =>
      s.title.toLowerCase().includes(nameLC) || s.detail.toLowerCase().includes(nameLC)
    )
  )
  relatedJourneys.forEach((j, i) => {
    const zone = ORBIT_ZONES.find(z => z.type === 'journey')!
    const angle = zone.angle + (i * 0.4 - relatedJourneys.length * 0.2)
    const id = `orbit-journey-${j.id}`
    orbitingCards.push({
      id,
      name: j.name,
      type: 'journey',
      stat: `${j.steps.length} steps`,
      icon: ICON_MAP.journey,
      size: 'small',
      position: [Math.cos(angle) * zone.radius, Math.sin(angle) * zone.radius + 1, 0],
      deferred: j.deferred,
    })
    orbitingEdges.push({ id: `orbit-edge-${id}`, from: mainId, to: id, visible: true })
  })

  // Related rules
  const relatedRules = model.business_rules.filter(r =>
    r.applies_to.some(a => a.toLowerCase().includes(nameLC) || nameLC.includes(a.toLowerCase()))
  )
  relatedRules.forEach((r, i) => {
    const zone = ORBIT_ZONES.find(z => z.type === 'rule')!
    const angle = zone.angle + (i * 0.4 - relatedRules.length * 0.2)
    const id = `orbit-rule-${r.id}`
    orbitingCards.push({
      id,
      name: r.description.slice(0, 40),
      type: 'rule',
      stat: r.id,
      icon: ICON_MAP.rule,
      size: 'small',
      position: [Math.cos(angle) * zone.radius, Math.sin(angle) * zone.radius + 1, 0],
    })
    orbitingEdges.push({ id: `orbit-edge-${id}`, from: mainId, to: id, visible: true })
  })

  // Related entities (field cross-refs)
  const relatedEntities = model.entities.filter(e => {
    if (e.id === entity.id) return false
    return entity.key_fields.some(f => f.description.toLowerCase().includes(e.name.toLowerCase()))
      || e.key_fields.some(f => f.description.toLowerCase().includes(nameLC))
  })
  relatedEntities.forEach((e, i) => {
    const zone = ORBIT_ZONES.find(z => z.type === 'entity')!
    const angle = zone.angle + (i * 0.4 - relatedEntities.length * 0.2)
    const id = `orbit-entity-${e.id}`
    orbitingCards.push({
      id,
      name: e.name,
      type: 'entity',
      stat: `${e.key_fields.length} fields`,
      icon: ICON_MAP.entity,
      size: 'small',
      position: [Math.cos(angle) * zone.radius, Math.sin(angle) * zone.radius + 1, 0],
      deferred: e.deferred,
    })
    orbitingEdges.push({ id: `orbit-edge-${id}`, from: mainId, to: id, visible: true })
  })

  return { mainCard, lifecycleCards, lifecycleEdges, orbitingCards, orbitingEdges }
}

// Idle state: all entities as cards in a cluster
export function buildAnatomyIdleData(model: IntentModel): CardNode[] {
  const domain = model.entities.filter(e => !e.is_integration)
  const integrations = model.entities.filter(e => e.is_integration)

  // Radial layout for domain entities
  const domainCards = domain.map((e, i) => {
    const angle = (i / domain.length) * Math.PI * 2
    const radius = 8
    return {
      id: e.id,
      name: e.name,
      type: 'entity' as ItemType,
      stat: `${e.key_fields.length} fields · ${e.lifecycle.states.length} states`,
      icon: ICON_MAP.entity,
      size: 'medium' as CardSize,
      deferred: e.deferred,
      position: [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0,
      ] as [number, number, number],
    }
  })

  // Integration entities in a tighter ring behind
  const integrationCards = integrations.map((e, i) => {
    const angle = (i / integrations.length) * Math.PI * 2
    const radius = 4
    return {
      id: e.id,
      name: e.name,
      type: 'entity' as ItemType,
      stat: `${e.key_fields.length} fields`,
      icon: ICON_MAP.entity,
      size: 'small' as CardSize,
      deferred: e.deferred,
      position: [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        2,
      ] as [number, number, number],
    }
  })

  return [...domainCards, ...integrationCards]
}
