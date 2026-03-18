'use client'

import { useRef, useState, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { IANodeData } from './ia-types'
import { ICON_MAP } from './ia-icons'

const statusColors = {
  done: '#25BA3B',
  partial: '#F59E0B',
  'not-built': '#D1D5DB',
} as const

const statusLabels = {
  done: 'Done',
  partial: 'Partial',
  'not-built': 'Not built',
} as const

export function IANode({ data }: NodeProps) {
  const nodeData = data as unknown as IANodeData
  const Icon = ICON_MAP[nodeData.iconName] ?? ICON_MAP.HelpCircle
  const statusColor = statusColors[nodeData.status]
  const [hovered, setHovered] = useState(false)
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isShared = nodeData.actor === 'shared'

  const showTooltip = useCallback(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current)
    setHovered(true)
  }, [])

  const hideTooltip = useCallback(() => {
    hideTimeout.current = setTimeout(() => setHovered(false), 150)
  }, [])

  return (
    <div
      className="group relative"
      style={{ zIndex: hovered ? 1000 : 'auto' }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <div
        className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition-all duration-200"
        style={{
          background: isShared ? 'transparent' : 'var(--bg-white)',
          border: `1px ${isShared ? 'dashed' : 'solid'} ${hovered ? 'var(--accent-blue)' : isShared ? 'var(--border-dark)' : 'var(--border-default)'}`,
          boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
          minWidth: 160,
          cursor: 'default',
          opacity: isShared ? 0.7 : 1,
        }}
      >
        <Handle type="target" position={Position.Left} className="!bg-transparent !border-0 !w-0 !h-0" />

        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{ background: isShared ? 'transparent' : 'var(--bg-gray-subtle)' }}
        >
          <Icon size={15} style={{ color: 'var(--text-secondary)' }} strokeWidth={isShared ? 1.4 : 1.8} />
        </div>

        <div className="flex flex-col gap-0.5">
          <span
            className="text-[13px] font-medium leading-tight"
            style={{ color: isShared ? 'var(--text-secondary)' : 'var(--text-primary)' }}
          >
            {nodeData.label}
          </span>
          <div className="flex items-center gap-1.5">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: statusColor }}
            />
            <span
              className="text-[10px] font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              {statusLabels[nodeData.status]}
            </span>
          </div>
        </div>

        <Handle type="source" position={Position.Right} className="!bg-transparent !border-0 !w-0 !h-0" />
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-xl px-4 py-3"
          style={{
            top: 'calc(100% + 4px)',
            background: 'var(--bg-white)',
            border: '1px solid var(--border-default)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            width: 280,
            zIndex: 1000,
          }}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
        >
          <p
            className="text-[12px] leading-relaxed m-0"
            style={{ color: 'var(--text-secondary)', border: 'none', padding: 0 }}
          >
            {nodeData.description}
          </p>
          {nodeData.refs && nodeData.refs.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {nodeData.refs.map(ref => (
                <span
                  key={ref}
                  className="inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                  style={{
                    background: 'var(--bg-blue-subtle)',
                    color: 'var(--accent-blue)',
                  }}
                >
                  {ref}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
