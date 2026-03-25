'use client'

import { useState } from 'react'
import { Database, Table } from 'lucide-react'
import { DataModelCanvas } from '@/components/data-model/data-model-canvas'
import { DatabaseSchemaCanvas } from '@/components/data-model/database-schema-canvas'
import type { DataModelGraphData } from '@/components/data-model/data-model-graph'
import type { DatabaseSchemaGraphData } from '@/components/data-model/database-schema-graph'
import type { DbmlEnum } from '@/components/data-model/parse-dbml'

type ViewType = 'intent' | 'schema'

type DataModelPageClientProps = {
  intentGraph: DataModelGraphData
  schemaGraph: DatabaseSchemaGraphData
  enums: DbmlEnum[]
}

export function DataModelPageClient({ intentGraph, schemaGraph, enums }: DataModelPageClientProps) {
  const [activeView, setActiveView] = useState<ViewType>('intent')

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
        {/* Intent Model tab */}
        <button
          type="button"
          onClick={() => setActiveView('intent')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200"
          style={{
            color: activeView === 'intent' ? '#0081F2' : 'var(--text-muted)',
            background: activeView === 'intent' ? 'rgba(0, 129, 242, 0.08)' : 'transparent',
          }}
        >
          <Database size={14} />
          Intent Model
          <span className="text-[11px] ml-1" style={{ opacity: 0.7 }}>
            ({intentGraph.stats.domainCount} entities)
          </span>
        </button>

        {/* Database Schema tab */}
        <button
          type="button"
          onClick={() => setActiveView('schema')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200"
          style={{
            color: activeView === 'schema' ? '#14B8A6' : 'var(--text-muted)',
            background: activeView === 'schema' ? 'rgba(20, 184, 166, 0.08)' : 'transparent',
          }}
        >
          <Table size={14} />
          Database Schema
          <span className="text-[11px] ml-1" style={{ opacity: 0.7 }}>
            ({schemaGraph.stats.tableCount} tables)
          </span>
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'intent' && (
          <DataModelCanvas
            initialNodes={intentGraph.nodes}
            initialEdges={intentGraph.edges}
            stats={intentGraph.stats}
          />
        )}
        {activeView === 'schema' && (
          <DatabaseSchemaCanvas
            initialNodes={schemaGraph.nodes}
            initialEdges={schemaGraph.edges}
            enums={enums}
            stats={schemaGraph.stats}
          />
        )}
      </div>
    </div>
  )
}
