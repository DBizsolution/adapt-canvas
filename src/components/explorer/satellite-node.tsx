'use client'

import { memo, useState, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { SatelliteNodeData } from './explorer-types'
import { SATELLITE_COLORS, SATELLITE_LABELS } from './explorer-types'

export const SatelliteNode = memo(function SatelliteNode({ data }: NodeProps) {
  const nodeData = data as unknown as SatelliteNodeData
  const color = SATELLITE_COLORS[nodeData.itemType]
  const [hovered, setHovered] = useState(false)

  const showTooltip = useCallback(() => setHovered(true), [])
  const hideTooltip = useCallback(() => setHovered(false), [])

  // Get a short description for the tooltip
  const description = (() => {
    const item = nodeData.item
    if ('description' in item) return (item as { description: string }).description
    if ('constraint' in item) return (item as { constraint: string }).constraint
    if ('question' in item) return (item as { question: string }).question
    return ''
  })()

  return (
    <div
      className="group relative"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <div
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-200 cursor-pointer"
        style={{
          background: color,
          boxShadow: hovered ? `0 4px 12px ${color}44` : 'none',
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <Handle type="target" position={Position.Left} id="left" className="!bg-transparent !border-0 !w-0 !h-0" />

        <span className="text-[10px] font-semibold uppercase tracking-wide text-white opacity-70">
          {SATELLITE_LABELS[nodeData.itemType]}
        </span>
        <span className="text-[12px] font-semibold text-white">
          {nodeData.label}
        </span>
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: 'calc(100% + 8px)', zIndex: 1000 }}
        >
          <div
            className="rounded-lg px-3 py-2"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              width: 240,
            }}
          >
            <p className="text-[11px] leading-relaxed m-0" style={{ color: 'var(--text-secondary)' }}>
              {description.length > 120 ? description.slice(0, 120) + '...' : description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
})
