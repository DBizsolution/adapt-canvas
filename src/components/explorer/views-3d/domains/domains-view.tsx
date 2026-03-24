'use client'

import { useMemo, useState, useCallback } from 'react'
import { SceneWrapper } from '../shared/scene-wrapper'
import { GlassCard } from '../shared/glass-card'
import { GlassPlatform } from '../shared/glass-platform'
import { ConnectionLine } from '../shared/connection-line'
import { buildDomainsData } from './domains-data'
import type { ViewProps } from '../shared/types'

export function DomainsView({ model }: ViewProps) {
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null)
  const [visibleThreads, setVisibleThreads] = useState<Set<string>>(new Set())

  const data = useMemo(() => buildDomainsData(model), [model])

  const toggleThread = useCallback((journeyId: string) => {
    setVisibleThreads(prev => {
      const next = new Set(prev)
      if (next.has(journeyId)) next.delete(journeyId)
      else next.add(journeyId)
      return next
    })
  }, [])

  // Entity position lookup (used by journey threads)
  const _entityPositionMap = useMemo(() => {
    const map = new Map<string, [number, number, number]>()
    for (const ec of data.entityCards) map.set(ec.id, ec.position)
    return map
  }, [data.entityCards])

  return (
    <div className="relative w-full h-full">
      <SceneWrapper>
        {/* Actor platforms */}
        {data.platforms.map(platform => (
          <GlassPlatform
            key={platform.actor.id}
            actor={platform.actor}
            position={platform.position}
            selected={selectedActorId === platform.actor.id}
            faded={!!selectedActorId && selectedActorId !== platform.actor.id}
            onClick={(id) => setSelectedActorId(prev => prev === id ? null : id)}
          />
        ))}

        {/* Floating entity cards */}
        {data.entityCards.map(card => (
          <GlassCard
            key={card.id}
            node={card}
            faded={!!selectedActorId && !data.platforms
              .find(p => p.actor.id === selectedActorId)
              ?.actor.responsibilities.some(r =>
                r.description.toLowerCase().includes(card.name.toLowerCase())
              )}
          />
        ))}

        {/* Journey threads */}
        {data.threads.map(thread => {
          if (!visibleThreads.has(thread.journeyId)) return null
          if (thread.points.length < 2) return null
          return thread.points.slice(0, -1).map((from, i) => (
            <ConnectionLine
              key={`thread-${thread.journeyId}-${i}`}
              from={from}
              to={thread.points[i + 1]}
              color={thread.color}
              visible
              thickness={2}
              opacity={0.7}
            />
          ))
        })}
      </SceneWrapper>

      {/* Journey thread toggle — bottom-right overlay */}
      <div
        className="absolute right-4 bottom-4 w-52 z-10 rounded-xl overflow-y-auto custom-scroll max-h-64"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}
      >
        <div className="p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#858481' }}>
            Journey Threads
          </p>
          {data.threads.map(thread => (
            <button
              key={thread.journeyId}
              onClick={() => toggleThread(thread.journeyId)}
              className="w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors mb-0.5 flex items-center gap-2"
              style={{
                background: visibleThreads.has(thread.journeyId) ? 'rgba(16,185,129,0.08)' : 'transparent',
                color: visibleThreads.has(thread.journeyId) ? thread.color : '#5E5E5B',
                fontWeight: visibleThreads.has(thread.journeyId) ? 600 : 400,
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: visibleThreads.has(thread.journeyId) ? thread.color : '#D4D4D4' }}
              />
              <span className="truncate">{thread.journeyName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
