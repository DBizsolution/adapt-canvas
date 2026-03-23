'use client'

import type { Entity } from '@/domain/intent-model/types'

type EntitySelectorProps = {
  entities: Entity[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function EntitySelector({ entities, selectedId, onSelect }: EntitySelectorProps) {
  const domain = entities.filter(e => !e.is_integration)
  const integrations = entities.filter(e => e.is_integration)

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
          Entities
        </p>
        {selectedId && (
          <button
            onClick={() => onSelect(null)}
            className="w-full text-left px-2 py-1.5 text-xs rounded-md mb-2 transition-colors"
            style={{ color: '#0081F2' }}
          >
            ← All entities
          </button>
        )}

        {domain.map(e => (
          <button
            key={e.id}
            onClick={() => onSelect(e.id)}
            className="w-full text-left px-2 py-2 text-xs rounded-md transition-colors mb-0.5"
            style={{
              background: selectedId === e.id ? 'rgba(0,129,242,0.08)' : 'transparent',
              color: selectedId === e.id ? '#0081F2' : '#34322D',
              fontWeight: selectedId === e.id ? 600 : 400,
            }}
          >
            <span className="block truncate">{e.name}</span>
            <span className="text-[10px]" style={{ color: '#858481' }}>
              {e.key_fields.length} fields · {e.lifecycle.states.length} states
            </span>
          </button>
        ))}

        {integrations.length > 0 && (
          <>
            <div className="my-2 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }} />
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#858481' }}>
              Integrations
            </p>
            {integrations.map(e => (
              <button
                key={e.id}
                onClick={() => onSelect(e.id)}
                className="w-full text-left px-2 py-2 text-xs rounded-md transition-colors mb-0.5"
                style={{
                  background: selectedId === e.id ? 'rgba(0,129,242,0.08)' : 'transparent',
                  color: selectedId === e.id ? '#0081F2' : '#5E5E5B',
                  fontWeight: selectedId === e.id ? 600 : 400,
                }}
              >
                <span className="block truncate">{e.name}</span>
                <span className="text-[10px]" style={{ color: '#858481' }}>
                  {e.key_fields.length} fields
                </span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
