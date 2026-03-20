'use client'

import { useCallback, useState, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { IntentModel, Entity } from '@/domain/intent-model/types'
import type { ExplorerNodeData, SatelliteNodeData, EntityRelationships } from './explorer-types'
import { ENTITY_COLOR, SATELLITE_COLORS, SATELLITE_LABELS } from './explorer-types'
import { buildExplorerGraph, buildSatelliteNodes } from './explorer-graph'
import { ExplorerNode } from './explorer-node'
import { SatelliteNode } from './satellite-node'
import { DetailPanel } from './detail-panel'

const nodeTypes = {
  explorer: ExplorerNode,
  satellite: SatelliteNode,
}

type DetailItem =
  | { type: 'entity'; entity: Entity; relationships?: EntityRelationships }
  | { type: 'satellite'; data: SatelliteNodeData }

export function ExplorerCanvas({ model }: { model: IntentModel }) {
  const graphData = useMemo(() => buildExplorerGraph(model), [model])

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(graphData.entityNodes as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData.entityEdges)
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [detailItem, setDetailItem] = useState<DetailItem | null>(null)

  // Store base entity nodes/edges for resetting
  const baseNodes = useMemo(() => graphData.entityNodes, [graphData])
  const baseEdges = useMemo(() => graphData.entityEdges, [graphData])

  const clearSelection = useCallback(() => {
    setSelectedEntityId(null)
    setDetailItem(null)
    setNodes(baseNodes)
    setEdges(baseEdges)
  }, [baseNodes, baseEdges, setNodes, setEdges])

  const selectEntity = useCallback((entityId: string) => {
    const entity = model.entities.find(e => e.id === entityId)
    if (!entity) return

    const relationships = graphData.relationshipMap.get(entityId)
    if (!relationships) return

    setSelectedEntityId(entityId)

    // Find entity node position
    const entityNode = baseNodes.find(n => n.id === entityId)
    if (!entityNode) return

    // Build satellite nodes
    const { nodes: satNodes, edges: satEdges } = buildSatelliteNodes(
      entityId,
      entityNode.position,
      relationships,
    )

    // Dim other entities, highlight selected
    const updatedEntityNodes = baseNodes.map(n => ({
      ...n,
      selected: n.id === entityId,
      style: {
        ...n.style,
        opacity: n.id === entityId ? 1 : 0.3,
        transition: 'opacity 200ms ease-out',
      },
    }))

    // Dim entity-entity edges
    const dimmedEdges = baseEdges.map(e => ({
      ...e,
      style: { ...e.style, opacity: 0.15 },
    }))

    setNodes([...updatedEntityNodes, ...satNodes])
    setEdges([...dimmedEdges, ...satEdges])

    // Open detail panel for entity
    setDetailItem({
      type: 'entity',
      entity,
      relationships,
    })
  }, [model, graphData, baseNodes, baseEdges, setNodes, setEdges])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'explorer') {
      const entityId = (node.data as unknown as ExplorerNodeData).entityId
      if (entityId === selectedEntityId) {
        clearSelection()
      } else {
        selectEntity(entityId)
      }
    } else if (node.type === 'satellite') {
      const data = node.data as unknown as SatelliteNodeData
      setDetailItem({ type: 'satellite', data })
    }
  }, [selectedEntityId, selectEntity, clearSelection])

  const onPaneClick = useCallback(() => {
    clearSelection()
  }, [clearSelection])

  // Elevate hovered node so tooltip renders above siblings
  const onNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
    setNodes(nds => nds.map(n => n.id === node.id ? { ...n, zIndex: 9999 } : n))
  }, [setNodes])

  const onNodeMouseLeave = useCallback((_: React.MouseEvent, node: Node) => {
    setNodes(nds => nds.map(n => n.id === node.id ? { ...n, zIndex: 0 } : n))
  }, [setNodes])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const entityIds = model.entities.map(ent => ent.id)
        if (entityIds.length === 0) return
        const currentIdx = selectedEntityId ? entityIds.indexOf(selectedEntityId) : -1
        const nextIdx = e.key === 'ArrowRight'
          ? (currentIdx + 1) % entityIds.length
          : (currentIdx - 1 + entityIds.length) % entityIds.length
        selectEntity(entityIds[nextIdx])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [clearSelection, selectEntity, selectedEntityId, model.entities])

  // Stats
  const totalItems = model.actors.length + model.entities.length + model.journeys.length
    + model.business_rules.length + model.constraints.length + model.open_questions.length
  const selectedRelationships = selectedEntityId ? graphData.relationshipMap.get(selectedEntityId) : null

  return (
    <div className="relative h-full w-full" style={{ background: 'var(--bg-page)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable={true}
        panOnScroll
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(0,0,0,0.06)" />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'satellite') {
              const d = node.data as unknown as SatelliteNodeData
              return SATELLITE_COLORS[d.itemType]
            }
            return ENTITY_COLOR
          }}
          maskColor="rgba(248,248,247,0.85)"
          style={{
            background: 'var(--bg-white)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
          }}
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 flex items-center gap-4 rounded-xl px-4 py-2.5"
        style={{
          background: 'var(--bg-white)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-float)',
        }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Nodes
        </span>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full" style={{ background: ENTITY_COLOR }} />
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Entity</span>
        </div>
        {Object.entries(SATELLITE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: color }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {SATELLITE_LABELS[type as SatelliteNodeData['itemType']]}
            </span>
          </div>
        ))}
        <div className="mx-1 h-3 w-px" style={{ background: 'var(--border-default)' }} />
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Edges
        </span>
        <div className="flex items-center gap-1.5">
          <svg width="20" height="6" className="shrink-0">
            <line x1="2" y1="3" x2="18" y2="3" stroke="#858481" strokeWidth="1.5" />
          </svg>
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Relationship</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="20" height="6" className="shrink-0">
            <line x1="2" y1="3" x2="18" y2="3" stroke="#858481" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
          </svg>
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Related</span>
        </div>
      </div>

      {/* Stats */}
      <div
        className="absolute top-4 right-4 flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-200"
        style={{
          background: 'var(--bg-white)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-float)',
          ...(detailItem ? { right: 416 } : {}),
        }}
      >
        <span className="text-[11px] font-semibold" style={{ color: 'var(--accent-blue)' }}>
          v{model.meta.version}
        </span>
        <span className="text-[11px] font-medium capitalize" style={{ color: 'var(--text-muted)' }}>
          {model.meta.status}
        </span>
        <div className="h-3 w-px" style={{ background: 'var(--border-default)' }} />
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          {model.entities.length} entities · {model.business_rules.length} rules · {totalItems} total
        </span>
        {selectedRelationships && selectedEntityId && (
          <>
            <div className="h-3 w-px" style={{ background: 'var(--border-default)' }} />
            <span className="text-[11px] font-semibold" style={{ color: ENTITY_COLOR }}>
              {model.entities.find(ent => ent.id === selectedEntityId)?.name} —{' '}
              {selectedRelationships.rules.length} rules, {selectedRelationships.journeys.length} journeys, {selectedRelationships.actors.length} actors
            </span>
          </>
        )}
      </div>

      {/* Detail Panel */}
      <DetailPanel
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onHighlightGroup={() => {}}
      />
    </div>
  )
}
