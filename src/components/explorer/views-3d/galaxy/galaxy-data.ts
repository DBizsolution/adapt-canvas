import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceRadial,
} from 'd3-force-3d'
import type { IntentModel } from '@/domain/intent-model/types'
import type { CardNode, ConnectionEdge, ItemType } from '../shared/types'
import { ICON_MAP } from '../shared/constants'

type SimNode = CardNode & { fx?: number; fy?: number; fz?: number; x: number; y: number; z: number }

// Zone centers for type clustering — separated spatially
const ZONE_CENTERS: Record<ItemType, [number, number, number]> = {
  entity:     [0, 0, 0],
  actor:      [-6, 3, -2],
  journey:    [6, 1, -1],
  rule:       [0, -4, 1],
  constraint: [-6, -4, 3],    // lower-left, forward
  question:   [6, -4, 3],     // lower-right, forward
}

// Deterministic seed from model content
function hashSeed(model: IntentModel): number {
  const str = `${model.meta.version}-${model.actors.length}-${model.entities.length}-${model.journeys.length}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// Simple seeded random
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export type GalaxyData = {
  nodes: CardNode[]
  edges: ConnectionEdge[]
}

export function buildGalaxyData(model: IntentModel): GalaxyData {
  const nodes: SimNode[] = []
  const edges: ConnectionEdge[] = []

  // --- Build nodes ---
  for (const e of model.entities) {
    const isIntegration = e.is_integration
    nodes.push({
      id: e.id,
      name: e.name,
      type: 'entity',
      stat: `${e.key_fields.length} fields · ${e.lifecycle.states.length} states`,
      icon: ICON_MAP.entity,
      size: isIntegration ? 'small' : 'medium',
      deferred: e.deferred,
      position: [0, 0, 0],
      x: 0, y: 0, z: 0,
    })
  }

  for (const a of model.actors) {
    nodes.push({
      id: a.id,
      name: a.name,
      type: 'actor',
      stat: `${a.responsibilities.length} responsibilities`,
      icon: ICON_MAP.actor,
      size: 'medium',
      deferred: a.deferred,
      position: [0, 0, 0],
      x: 0, y: 0, z: 0,
    })
  }

  for (const j of model.journeys) {
    nodes.push({
      id: j.id,
      name: j.name,
      type: 'journey',
      stat: `${j.steps.length} steps · ${j.primary_actor}`,
      icon: ICON_MAP.journey,
      size: 'medium',
      deferred: j.deferred,
      position: [0, 0, 0],
      x: 0, y: 0, z: 0,
    })
  }

  for (const r of model.business_rules) {
    nodes.push({
      id: r.id,
      name: r.description.slice(0, 60),
      type: 'rule',
      stat: `applies to ${r.applies_to.length}`,
      icon: ICON_MAP.rule,
      size: 'small',
      position: [0, 0, 0],
      x: 0, y: 0, z: 0,
    })
  }

  for (const c of model.constraints) {
    nodes.push({
      id: c.id,
      name: c.constraint.slice(0, 60),
      type: 'constraint',
      stat: c.type,
      icon: ICON_MAP.constraint,
      size: 'small',
      position: [0, 0, 0],
      x: 0, y: 0, z: 0,
    })
  }

  for (const q of model.open_questions) {
    nodes.push({
      id: q.id,
      name: q.question.slice(0, 60),
      type: 'question',
      stat: q.status,
      icon: ICON_MAP.question,
      size: 'small',
      position: [0, 0, 0],
      x: 0, y: 0, z: 0,
    })
  }

  // --- Build edges (cross-references) ---

  // Journey → primary actor
  for (const j of model.journeys) {
    const actorNode = nodes.find(n => n.type === 'actor' && model.actors.find(a => a.id === n.id && a.name.toLowerCase().includes(j.primary_actor.toLowerCase())))
    if (actorNode) {
      edges.push({ id: `${j.id}-${actorNode.id}`, from: j.id, to: actorNode.id })
    }
  }

  // Rule → entities (by applies_to text matching)
  for (const r of model.business_rules) {
    for (const e of model.entities) {
      const nameLC = e.name.toLowerCase()
      if (r.applies_to.some(a => a.toLowerCase().includes(nameLC) || nameLC.includes(a.toLowerCase()))) {
        edges.push({ id: `${r.id}-${e.id}`, from: r.id, to: e.id })
      }
    }
  }

  // Entity → entity (field description text matching)
  for (const e of model.entities) {
    for (const f of e.key_fields) {
      for (const other of model.entities) {
        if (other.id === e.id) continue
        if (f.description.toLowerCase().includes(other.name.toLowerCase())) {
          edges.push({ id: `${e.id}-${other.id}-${f.name}`, from: e.id, to: other.id })
        }
      }
    }
  }

  // --- Run force simulation ---
  const seed = hashSeed(model)
  const rand = seededRandom(seed)

  // Initialize positions near zone centers with jitter
  for (const node of nodes) {
    const center = ZONE_CENTERS[node.type]
    node.x = center[0] + (rand() - 0.5) * 3
    node.y = center[1] + (rand() - 0.5) * 3
    node.z = center[2] + (rand() - 0.5) * 3
  }

  const simLinks = edges.map(e => ({ source: e.from, target: e.to }))

  const sim = forceSimulation(nodes, 3)
    .force('charge', forceManyBody().strength(-80))
    .force('link', forceLink(simLinks).id((d: SimNode) => d.id).distance(15))
    .force('center', forceCenter(0, 0, 0).strength(0.1))

  // Per-type radial forces toward zone centers
  for (const type of Object.keys(ZONE_CENTERS) as ItemType[]) {
    const center = ZONE_CENTERS[type]
    sim.force(`radial-${type}`, forceRadial(
      4, center[0], center[1], center[2]
    ).strength((d: SimNode) => d.type === type ? 0.5 : 0))
  }

  sim.tick(300)
  sim.stop()

  // Lock positions
  const finalNodes: CardNode[] = nodes.map(n => ({
    id: n.id,
    name: n.name,
    type: n.type,
    stat: n.stat,
    icon: n.icon,
    size: n.size,
    deferred: n.deferred,
    position: [n.x, n.y, n.z] as [number, number, number],
  }))

  return { nodes: finalNodes, edges }
}
