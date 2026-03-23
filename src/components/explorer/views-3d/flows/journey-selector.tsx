'use client'

import type { Journey } from '@/domain/intent-model/types'

type JourneySelectorProps = {
  journeys: Journey[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function JourneySelector({ journeys, selectedId, onSelect }: JourneySelectorProps) {
  return (
    <div
      className="absolute left-4 top-4 bottom-4 w-56 z-10 rounded-xl overflow-y-auto custom-scroll"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}
    >
      <div className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#858481' }}>
          Journeys
        </p>
        {selectedId && (
          <button
            onClick={() => onSelect(null)}
            className="w-full text-left px-2 py-1.5 text-xs rounded-md mb-2 transition-colors"
            style={{ color: '#0081F2' }}
          >
            ← All journeys
          </button>
        )}
        {journeys.map(j => (
          <button
            key={j.id}
            onClick={() => onSelect(j.id)}
            className="w-full text-left px-2 py-2 text-xs rounded-md transition-colors mb-0.5"
            style={{
              background: selectedId === j.id ? 'rgba(0,129,242,0.08)' : 'transparent',
              color: selectedId === j.id ? '#0081F2' : '#34322D',
              fontWeight: selectedId === j.id ? 600 : 400,
            }}
          >
            <span className="block truncate">{j.name}</span>
            <span className="text-[10px]" style={{ color: '#858481' }}>
              {j.steps.length} steps · {j.primary_actor}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
