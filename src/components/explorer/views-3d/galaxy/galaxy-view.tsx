'use client'

import { useMemo, useState, useCallback } from 'react'
import { Text } from '@react-three/drei'
import { SceneWrapper } from '../shared/scene-wrapper'
import { GlassCard } from '../shared/glass-card'
import { ConnectionLine } from '../shared/connection-line'
import { buildGalaxyData } from './galaxy-data'
import { TYPE_COLORS } from '../shared/constants'
import type { ViewProps, ItemType } from '../shared/types'

const ZONE_LABELS: { type: ItemType; label: string; position: [number, number, number] }[] = [
  { type: 'entity', label: 'Entities', position: [0, -2, -3] },
  { type: 'actor', label: 'Actors', position: [-12, 3, -7] },
  { type: 'journey', label: 'Journeys', position: [12, -1, -5] },
  { type: 'rule', label: 'Rules', position: [0, -11, -1] },
  { type: 'constraint', label: 'Constraints', position: [-10, -9, 3] },
  { type: 'question', label: 'Questions', position: [10, -9, 3] },
]

export function GalaxyView({ model }: ViewProps) {
  const data = useMemo(() => buildGalaxyData(model), [model])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [hiddenTypes, setHiddenTypes] = useState<Set<ItemType>>(new Set())
  const [presenting, setPresenting] = useState(false)

  const activeId = selectedId || hoveredId

  // Which nodes are connected to the active node
  const connectedIds = useMemo(() => {
    if (!activeId) return new Set<string>()
    const ids = new Set<string>()
    for (const e of data.edges) {
      if (e.from === activeId) ids.add(e.to)
      if (e.to === activeId) ids.add(e.from)
    }
    ids.add(activeId)
    return ids
  }, [activeId, data.edges])

  const nodePositionMap = useMemo(() => {
    const map = new Map<string, [number, number, number]>()
    for (const n of data.nodes) map.set(n.id, n.position)
    return map
  }, [data.nodes])

  const toggleType = useCallback((type: ItemType) => {
    setHiddenTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  return (
    <div className="relative w-full h-full">
      <SceneWrapper autoRotate={presenting}>
        {/* Cluster labels */}
        {ZONE_LABELS.map(({ type, label, position }) => (
          !hiddenTypes.has(type) && (
            <Text
              key={type}
              position={position}
              fontSize={3}
              color={TYPE_COLORS[type]}
              fillOpacity={0.15}
              anchorX="center"
              anchorY="middle"
              font="/fonts/DMSans-Variable.ttf"
            >
              {label}
            </Text>
          )
        ))}

        {/* Cards */}
        {data.nodes.map(node => (
          !hiddenTypes.has(node.type) && (
            <GlassCard
              key={node.id}
              node={node}
              selected={selectedId === node.id}
              faded={!!activeId && !connectedIds.has(node.id)}
              onClick={(id) => setSelectedId(prev => prev === id ? null : id)}
              onHover={setHoveredId}
            />
          )
        ))}

        {/* Connections — visible only when a node is active */}
        {data.edges.map(edge => {
          const fromPos = nodePositionMap.get(edge.from)
          const toPos = nodePositionMap.get(edge.to)
          if (!fromPos || !toPos) return null
          if (hiddenTypes.has(data.nodes.find(n => n.id === edge.from)?.type as ItemType)) return null
          if (hiddenTypes.has(data.nodes.find(n => n.id === edge.to)?.type as ItemType)) return null

          const isActive = activeId && (edge.from === activeId || edge.to === activeId)
          const edgeColor = isActive
            ? TYPE_COLORS[data.nodes.find(n => n.id === activeId)?.type || 'entity']
            : undefined

          return (
            <ConnectionLine
              key={edge.id}
              from={fromPos}
              to={toPos}
              visible={!!isActive}
              color={edgeColor}
              animated={!!selectedId && !!isActive}
            />
          )
        })}
      </SceneWrapper>

      {/* Filter bar — HTML overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {(['entity', 'actor', 'journey', 'rule', 'constraint', 'question'] as ItemType[]).map(type => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className="px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200"
            style={{
              background: hiddenTypes.has(type) ? 'transparent' : TYPE_COLORS[type] + '18',
              color: TYPE_COLORS[type],
              border: `1.5px solid ${TYPE_COLORS[type]}${hiddenTypes.has(type) ? '40' : ''}`,
              opacity: hiddenTypes.has(type) ? 0.5 : 1,
            }}
          >
            {type === 'question' ? 'Questions' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
          </button>
        ))}

        <button
          onClick={() => setPresenting(p => !p)}
          className="px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ml-2"
          style={{
            background: presenting ? '#002C61' : 'rgba(0,0,0,0.05)',
            color: presenting ? '#fff' : '#858481',
            border: '1.5px solid transparent',
          }}
        >
          {presenting ? 'Stop' : 'Present'}
        </button>
      </div>
    </div>
  )
}
