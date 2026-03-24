'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { SceneWrapper } from '../shared/scene-wrapper'
import { GlassCard } from '../shared/glass-card'
import { ConnectionLine } from '../shared/connection-line'
import { buildFlowsData, buildFlowsIdleData } from './flows-data'
import { JourneySelector } from './journey-selector'
import { TYPE_COLORS, CONNECTION_ACTIVE_COLOR, ANIMATION } from '../shared/constants'
import type { ViewProps } from '../shared/types'

export function FlowsView({ model }: ViewProps) {
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const journey = selectedJourneyId
    ? model.journeys.find(j => j.id === selectedJourneyId)
    : null

  const flowData = useMemo(
    () => journey ? buildFlowsData(journey, model) : null,
    [journey, model]
  )

  const idleCards = useMemo(
    () => !journey ? buildFlowsIdleData(model) : null,
    [journey, model]
  )

  // Step-through mode
  useEffect(() => {
    if (!playing || !journey) return
    setActiveStep(0)
    timerRef.current = setInterval(() => {
      setActiveStep(prev => {
        if (prev === null || prev >= journey.steps.length - 1) {
          setPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, ANIMATION.stepThroughMs)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing, journey])

  // Arrow key navigation
  useEffect(() => {
    if (!journey) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setActiveStep(prev => Math.min((prev ?? -1) + 1, journey.steps.length - 1))
      if (e.key === 'ArrowLeft') setActiveStep(prev => Math.max((prev ?? 1) - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [journey])

  const nodePositionMap = useMemo(() => {
    if (!flowData) return new Map()
    const map = new Map<string, [number, number, number]>()
    for (const n of [...flowData.stepCards, ...flowData.branchCards]) {
      map.set(n.id, n.position)
    }
    return map
  }, [flowData])

  return (
    <div className="relative w-full h-full">
      <JourneySelector
        journeys={model.journeys}
        selectedId={selectedJourneyId}
        onSelect={(id) => { setSelectedJourneyId(id); setActiveStep(null); setPlaying(false) }}
      />

      <SceneWrapper>
        {/* Idle state — journey cards in a grid */}
        {idleCards?.map(card => (
          <GlassCard
            key={card.id}
            node={card}
            onClick={(id) => setSelectedJourneyId(id)}
          />
        ))}

        {/* Active journey — step cards */}
        {flowData?.stepCards.map((card, i) => (
          <GlassCard
            key={card.id}
            node={card}
            selected={activeStep === i}
            faded={activeStep !== null && activeStep !== i}
          />
        ))}

        {/* Branch cards */}
        {flowData?.branchCards.map(card => {
          const parentEdge = flowData.edges.find(e => e.to === card.id)
          const parentStepIdx = parentEdge
            ? flowData.stepCards.findIndex(s => s.id === parentEdge.from)
            : -1
          const isFaded = activeStep !== null && parentStepIdx !== activeStep

          return (
            <GlassCard
              key={card.id}
              node={card}
              faded={isFaded}
            />
          )
        })}

        {/* Connection lines */}
        {flowData?.edges.map(edge => {
          const fromPos = nodePositionMap.get(edge.from)
          const toPos = nodePositionMap.get(edge.to)
          if (!fromPos || !toPos) return null

          const toNode = flowData.branchCards.find(n => n.id === edge.to)
          const color = toNode ? TYPE_COLORS[toNode.type] : CONNECTION_ACTIVE_COLOR

          return (
            <ConnectionLine
              key={edge.id}
              from={fromPos}
              to={toPos}
              color={color}
              visible
              opacity={0.7}
            />
          )
        })}

        {/* Rail line connecting steps */}
        {flowData && flowData.railPoints.length > 1 && (
          flowData.railPoints.slice(0, -1).map((from, i) => (
            <ConnectionLine
              key={`rail-${i}`}
              from={from}
              to={flowData.railPoints[i + 1]}
              color={TYPE_COLORS.journey}
              visible
              opacity={0.5}
              thickness={2.5}
            />
          ))
        )}
      </SceneWrapper>

      {/* Step-through controls */}
      {journey && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          <button
            onClick={() => setPlaying(p => !p)}
            className="px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200"
            style={{
              background: playing ? '#002C61' : 'rgba(0,0,0,0.05)',
              color: playing ? '#fff' : '#858481',
            }}
          >
            {playing ? 'Stop' : 'Play'}
          </button>
          {activeStep !== null && (
            <span className="text-xs" style={{ color: '#858481' }}>
              Step {activeStep + 1} of {journey.steps.length} — Use ← → to navigate
            </span>
          )}
        </div>
      )}
    </div>
  )
}
