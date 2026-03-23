import type { IntentModel, Actor } from '@/domain/intent-model/types'
import type { CardNode, ItemType } from '../shared/types'
import { ICON_MAP } from '../shared/constants'

export type DomainPlatform = {
  actor: Actor
  position: [number, number, number]
  connectionCount: number
}

export type JourneyThread = {
  journeyId: string
  journeyName: string
  points: [number, number, number][]  // actor platform → entity → ... path
  color: string
}

export type DomainsData = {
  platforms: DomainPlatform[]
  entityCards: CardNode[]
  threads: JourneyThread[]
}

const PLATFORM_SPACING_Z = 8
const PLATFORM_SPREAD_X = 12
const GREEN_SHADES = ['#10B981', '#059669', '#047857', '#065F46', '#34D399', '#6EE7B7',
  '#A7F3D0', '#D1FAE5', '#ECFDF5', '#14B8A6', '#0D9488', '#0F766E', '#115E59', '#134E4A']

export function buildDomainsData(model: IntentModel): DomainsData {
  // Count connections per actor
  const actorConnections = model.actors.map(actor => {
    const nameLC = actor.name.toLowerCase()
    let count = actor.responsibilities.length

    // Journeys where actor is primary
    count += model.journeys.filter(j =>
      j.primary_actor.toLowerCase().includes(nameLC) || nameLC.includes(j.primary_actor.toLowerCase())
    ).length

    // Entities mentioned in responsibilities
    for (const r of actor.responsibilities) {
      for (const e of model.entities) {
        if (r.description.toLowerCase().includes(e.name.toLowerCase())) count++
      }
    }

    return { actor, count }
  })

  // Sort by connection count descending (most connected = closest to camera)
  actorConnections.sort((a, b) => b.count - a.count)

  // Position platforms at increasing Z-depth
  const platforms: DomainPlatform[] = actorConnections.map(({ actor, count }, i) => ({
    actor,
    connectionCount: count,
    position: [
      (i % 2 === 0 ? -1 : 1) * PLATFORM_SPREAD_X * 0.3 * (i > 0 ? 1 : 0),
      (actorConnections.length - 1 - i) * 3 - (actorConnections.length * 1.5),
      i * PLATFORM_SPACING_Z,
    ] as [number, number, number],
  }))

  // Position entities — shared entities between referencing actors
  const entityCards: CardNode[] = model.entities.map(entity => {
    const nameLC = entity.name.toLowerCase()

    // Find which actors reference this entity
    const referencingPlatforms = platforms.filter(p =>
      p.actor.responsibilities.some(r => r.description.toLowerCase().includes(nameLC))
    )

    // Position at average of referencing platforms (overlap zone)
    let pos: [number, number, number]
    if (referencingPlatforms.length > 0) {
      const avgX = referencingPlatforms.reduce((s, p) => s + p.position[0], 0) / referencingPlatforms.length
      const avgY = referencingPlatforms.reduce((s, p) => s + p.position[1], 0) / referencingPlatforms.length
      const avgZ = referencingPlatforms.reduce((s, p) => s + p.position[2], 0) / referencingPlatforms.length
      pos = [avgX + (Math.random() - 0.5) * 3, avgY + 2, avgZ]
    } else {
      // No references — place at periphery
      pos = [PLATFORM_SPREAD_X * 0.8, 0, platforms.length * PLATFORM_SPACING_Z * 0.5]
    }

    return {
      id: entity.id,
      name: entity.name,
      type: 'entity' as ItemType,
      stat: `${entity.key_fields.length} fields`,
      icon: ICON_MAP.entity,
      size: 'small' as const,
      deferred: entity.deferred,
      position: pos,
    }
  })

  // Journey threads — trace primary_actor → entities
  const threads: JourneyThread[] = model.journeys.map((journey, i) => {
    const points: [number, number, number][] = []

    // Find primary actor platform
    const actorPlatform = platforms.find(p =>
      p.actor.name.toLowerCase().includes(journey.primary_actor.toLowerCase())
      || journey.primary_actor.toLowerCase().includes(p.actor.name.toLowerCase())
    )
    if (actorPlatform) points.push(actorPlatform.position)

    // Find entities mentioned in journey steps
    for (const step of journey.steps) {
      const text = `${step.title} ${step.detail}`.toLowerCase()
      for (const ec of entityCards) {
        if (text.includes(ec.name.toLowerCase()) && !points.some(p => p === ec.position)) {
          points.push(ec.position)
        }
      }
    }

    return {
      journeyId: journey.id,
      journeyName: journey.name,
      points,
      color: GREEN_SHADES[i % GREEN_SHADES.length],
    }
  })

  return { platforms, entityCards, threads }
}
