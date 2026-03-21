'use client'

import { useState } from 'react'
import { Network, BookOpen, Code2, Box } from 'lucide-react'
import type { IntentModel } from '@/domain/intent-model/types'
import { ExplorerCanvas } from './explorer-canvas'
import { ModelReader } from './model-reader'
import { ModelSource } from './model-source'
import { Graph3D } from './graph-3d'
import { Graph3DLifecycle } from './graph-3d-lifecycle'
import { Graph3DActors } from './graph-3d-actors'
import type { ExplorerPositions } from '@/lib/explorer-positions-store'

const tabs = [
  { id: 'graph', label: 'Graph', icon: Network },
  { id: '3d', label: '3D', icon: Box },
  { id: 'model', label: 'Model', icon: BookOpen },
  { id: 'source', label: 'Source', icon: Code2 },
] as const

const VIEWS_3D = [
  { id: 'force', label: 'Force' },
  { id: 'lifecycle', label: 'Lifecycle' },
  { id: 'actors', label: 'Actor Layers' },
] as const

type View3D = (typeof VIEWS_3D)[number]['id']

type TabId = (typeof tabs)[number]['id']

export function ExplorerTabs({ model, savedPositions, modelSource }: { model: IntentModel; savedPositions: ExplorerPositions; modelSource: string }) {
  const [activeTab, setActiveTab] = useState<TabId>('graph')
  const [view3d, setView3d] = useState<View3D>('force')

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div
        className="flex items-center gap-1 px-3 shrink-0"
        style={{
          height: 44,
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-page)',
        }}
      >
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200"
              style={{
                color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                background: isActive ? 'var(--bg-blue-subtle)' : 'transparent',
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}

        {/* 3D view selector */}
        {activeTab === '3d' && (
          <>
            <div className="mx-1 h-4 w-px" style={{ background: 'var(--border-default)' }} />
            {VIEWS_3D.map(view => (
              <button
                key={view.id}
                type="button"
                onClick={() => setView3d(view.id)}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors duration-200"
                style={{
                  color: view3d === view.id ? 'var(--accent-blue)' : 'var(--text-muted)',
                  background: view3d === view.id ? 'var(--bg-blue-subtle)' : 'transparent',
                }}
              >
                {view.label}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'graph' && (
          <ExplorerCanvas model={model} savedPositions={savedPositions} />
        )}
        {activeTab === '3d' && view3d === 'force' && (
          <Graph3D model={model} />
        )}
        {activeTab === '3d' && view3d === 'lifecycle' && (
          <Graph3DLifecycle model={model} />
        )}
        {activeTab === '3d' && view3d === 'actors' && (
          <Graph3DActors model={model} />
        )}
        {activeTab === 'model' && (
          <ModelReader model={model} />
        )}
        {activeTab === 'source' && (
          <ModelSource source={modelSource} />
        )}
      </div>
    </div>
  )
}
