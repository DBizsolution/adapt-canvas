'use client'

import { useMemo, useState } from 'react'
import { SceneWrapper } from '../shared/scene-wrapper'
import { GlassCard } from '../shared/glass-card'
import { ConnectionLine } from '../shared/connection-line'
import { buildAnatomyData, buildAnatomyIdleData } from './anatomy-data'
import { EntitySelector } from './entity-selector'
import { TYPE_COLORS } from '../shared/constants'
import type { ViewProps } from '../shared/types'

export function AnatomyView({ model }: ViewProps) {
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)

  const entity = selectedEntityId
    ? model.entities.find(e => e.id === selectedEntityId)
    : null

  const anatomyData = useMemo(
    () => entity ? buildAnatomyData(entity, model) : null,
    [entity, model]
  )

  const idleCards = useMemo(
    () => !entity ? buildAnatomyIdleData(model) : null,
    [entity, model]
  )

  const nodePositionMap = useMemo(() => {
    if (!anatomyData) return new Map<string, [number, number, number]>()
    const map = new Map<string, [number, number, number]>()
    map.set(anatomyData.mainCard.id, anatomyData.mainCard.position)
    for (const n of [...anatomyData.lifecycleCards, ...anatomyData.orbitingCards]) {
      map.set(n.id, n.position)
    }
    return map
  }, [anatomyData])

  return (
    <div className="relative w-full h-full">
      <EntitySelector
        entities={model.entities}
        selectedId={selectedEntityId}
        onSelect={setSelectedEntityId}
      />

      <SceneWrapper>
        {/* Idle state — entity cards in cluster */}
        {idleCards?.map(card => (
          <GlassCard
            key={card.id}
            node={card}
            onClick={(id) => setSelectedEntityId(id)}
          />
        ))}

        {/* Main entity panel */}
        {anatomyData && (
          <GlassCard
            key={anatomyData.mainCard.id}
            node={anatomyData.mainCard}
            selected
          />
        )}

        {/* Lifecycle rail */}
        {anatomyData?.lifecycleCards.map(card => (
          <GlassCard key={card.id} node={card} />
        ))}

        {/* Lifecycle edges */}
        {anatomyData?.lifecycleEdges.map(edge => {
          const fromPos = nodePositionMap.get(edge.from)
          const toPos = nodePositionMap.get(edge.to)
          if (!fromPos || !toPos) return null
          return (
            <ConnectionLine
              key={edge.id}
              from={fromPos}
              to={toPos}
              color={edge.color}
              visible
              thickness={1.5}
            />
          )
        })}

        {/* Orbiting cards */}
        {anatomyData?.orbitingCards.map(card => (
          <GlassCard key={card.id} node={card} />
        ))}

        {/* Orbiting edges */}
        {anatomyData?.orbitingEdges.map(edge => {
          const fromPos = nodePositionMap.get(edge.from)
          const toPos = nodePositionMap.get(edge.to)
          if (!fromPos || !toPos) return null
          const toNode = anatomyData.orbitingCards.find(n => n.id === edge.to)
          return (
            <ConnectionLine
              key={edge.id}
              from={fromPos}
              to={toPos}
              color={toNode ? TYPE_COLORS[toNode.type] : undefined}
              visible
            />
          )
        })}
      </SceneWrapper>
    </div>
  )
}
