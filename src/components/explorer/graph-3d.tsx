'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import type { IntentModel, SectionType } from '@/domain/intent-model/types'
import { ENTITY_COLOR } from './explorer-types'

// 3d-force-graph is a browser-only library — dynamic import
type ForceGraph3DInstance = {
  graphData: (data: { nodes: GraphNode[]; links: GraphLink[] }) => ForceGraph3DInstance
  nodeColor: (fn: (node: GraphNode) => string) => ForceGraph3DInstance
  nodeLabel: (fn: (node: GraphNode) => string) => ForceGraph3DInstance
  nodeVal: (fn: (node: GraphNode) => number) => ForceGraph3DInstance
  nodeThreeObject?: (fn: (node: GraphNode) => unknown) => ForceGraph3DInstance
  linkColor: (fn: (link: GraphLink) => string) => ForceGraph3DInstance
  linkWidth: (fn: (link: GraphLink) => number) => ForceGraph3DInstance
  linkOpacity: (val: number) => ForceGraph3DInstance
  linkDirectionalParticles: (val: number) => ForceGraph3DInstance
  linkDirectionalParticleSpeed: (val: number) => ForceGraph3DInstance
  backgroundColor: (val: string) => ForceGraph3DInstance
  width: (val: number) => ForceGraph3DInstance
  height: (val: number) => ForceGraph3DInstance
  onNodeClick: (fn: (node: GraphNode) => void) => ForceGraph3DInstance
  onNodeHover: (fn: (node: GraphNode | null) => void) => ForceGraph3DInstance
  d3Force: (name: string, force?: unknown) => unknown
  _destructor?: () => void
}

type GraphNode = {
  id: string
  name: string
  type: SectionType | 'entity'
  description: string
  group: string
  val: number
  x?: number
  y?: number
  z?: number
}

type GraphLink = {
  source: string
  target: string
  type: 'entity-entity' | 'rule-entity' | 'journey-actor' | 'actor-entity' | 'constraint-entity' | 'question-entity'
}

const TYPE_COLORS: Record<string, string> = {
  entity: ENTITY_COLOR,
  actor: '#8B5CF6',
  journey: '#10B981',
  business_rule: '#F59E0B',
  constraint: '#EF4444',
  open_question: '#EC4899',
}

const TYPE_LABELS: Record<string, string> = {
  entity: 'Entity',
  actor: 'Actor',
  journey: 'Journey',
  business_rule: 'Rule',
  constraint: 'Constraint',
  open_question: 'Question',
}

function buildGraphData(model: IntentModel): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []

  // Entities
  for (const e of model.entities) {
    nodes.push({
      id: `entity:${e.id}`,
      name: e.name,
      type: 'entity',
      description: e.description.slice(0, 150),
      group: 'entity',
      val: 8 + e.key_fields.length,
    })
  }

  // Actors
  for (const a of model.actors) {
    nodes.push({
      id: `actor:${a.id}`,
      name: a.name,
      type: 'actor',
      description: a.description.slice(0, 150),
      group: 'actor',
      val: 6 + a.responsibilities.length,
    })
  }

  // Journeys
  for (const j of model.journeys) {
    nodes.push({
      id: `journey:${j.id}`,
      name: j.name,
      type: 'journey',
      description: `${j.steps.length} steps — ${j.success_outcome.slice(0, 100)}`,
      group: 'journey',
      val: 4 + j.steps.length,
    })

    // Journey → primary actor
    const actorNodeId = `actor:${j.primary_actor}`
    if (nodes.some(n => n.id === actorNodeId)) {
      links.push({ source: `journey:${j.id}`, target: actorNodeId, type: 'journey-actor' })
    }
  }

  // Business rules
  for (const r of model.business_rules) {
    nodes.push({
      id: `rule:${r.id}`,
      name: r.id,
      type: 'business_rule',
      description: r.description.slice(0, 150),
      group: 'business_rule',
      val: 3,
    })

    // Rule → applies_to entities/actors
    for (const ref of r.applies_to) {
      const entityId = `entity:${ref}`
      const actorId = `actor:${ref}`
      if (nodes.some(n => n.id === entityId)) {
        links.push({ source: `rule:${r.id}`, target: entityId, type: 'rule-entity' })
      } else if (nodes.some(n => n.id === actorId)) {
        links.push({ source: `rule:${r.id}`, target: actorId, type: 'rule-entity' })
      }
    }
  }

  // Constraints — link to entities mentioned in constraint text
  for (const c of model.constraints) {
    nodes.push({
      id: `constraint:${c.id}`,
      name: c.id,
      type: 'constraint',
      description: c.constraint.slice(0, 150),
      group: 'constraint',
      val: 6,
    })

    for (const e of model.entities) {
      const names = [e.id, e.name.toLowerCase()]
      const abbr = e.name.match(/\(([A-Z][A-Z0-9]+)\)/)
      if (abbr) names.push(abbr[1].toLowerCase())
      if (names.some(n => c.constraint.toLowerCase().includes(n))) {
        links.push({ source: `constraint:${c.id}`, target: `entity:${e.id}`, type: 'constraint-entity' })
      }
    }
  }

  // Open questions — link to entities mentioned in question text
  for (const q of model.open_questions) {
    nodes.push({
      id: `question:${q.id}`,
      name: q.id,
      type: 'open_question',
      description: q.question.slice(0, 150),
      group: 'open_question',
      val: 6,
    })

    for (const e of model.entities) {
      const names = [e.id, e.name.toLowerCase()]
      const abbr = e.name.match(/\(([A-Z][A-Z0-9]+)\)/)
      if (abbr) names.push(abbr[1].toLowerCase())
      if (names.some(n => q.question.toLowerCase().includes(n) || q.reason.toLowerCase().includes(n))) {
        links.push({ source: `question:${q.id}`, target: `entity:${e.id}`, type: 'question-entity' })
      }
    }
  }

  // Entity-to-entity edges (from field references)
  for (const entity of model.entities) {
    for (const other of model.entities) {
      if (entity.id === other.id) continue
      const otherNames = [other.id, other.name.toLowerCase()]
      const abbr = other.name.match(/\(([A-Z][A-Z0-9]+)\)/)
      if (abbr) otherNames.push(abbr[1].toLowerCase())

      const hasRef = entity.key_fields.some(f => {
        const text = `${f.type} ${f.description}`.toLowerCase()
        return otherNames.some(n => text.includes(n))
      })

      if (hasRef) {
        const key = [entity.id, other.id].sort().join('--')
        if (!links.some(l => {
          const src = typeof l.source === 'string' ? l.source : ''
          const tgt = typeof l.target === 'string' ? l.target : ''
          return [src.replace('entity:', ''), tgt.replace('entity:', '')].sort().join('--') === key
        })) {
          links.push({ source: `entity:${entity.id}`, target: `entity:${other.id}`, type: 'entity-entity' })
        }
      }
    }
  }

  return { nodes, links }
}

const ALL_TYPES = Object.keys(TYPE_COLORS) as Array<keyof typeof TYPE_COLORS>

export function Graph3D({ model }: { model: IntentModel }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<ForceGraph3DInstance | null>(null)
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set())
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const fullGraphData = useRef(buildGraphData(model))

  const toggleType = useCallback((type: string) => {
    setHiddenTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const toggleNode = useCallback((nodeId: string) => {
    setHiddenNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      return next
    })
  }, [])

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node)
  }, [])

  // Update graph data when filters change
  useEffect(() => {
    if (!graphRef.current) return
    const { nodes, links } = fullGraphData.current
    const visibleNodes = nodes.filter(n => !hiddenTypes.has(n.type) && !hiddenNodes.has(n.id))
    const visibleIds = new Set(visibleNodes.map(n => n.id))
    const visibleLinks = links.filter(l => {
      const src = typeof l.source === 'string' ? l.source : (l.source as unknown as GraphNode)?.id
      const tgt = typeof l.target === 'string' ? l.target : (l.target as unknown as GraphNode)?.id
      return visibleIds.has(src) && visibleIds.has(tgt)
    })
    graphRef.current.graphData({ nodes: visibleNodes, links: visibleLinks })
  }, [hiddenTypes, hiddenNodes])

  useEffect(() => {
    if (!containerRef.current) return

    let destroyed = false

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import('3d-force-graph').then(async (mod: any) => {
      if (destroyed || !containerRef.current) return

      const ForceGraph3D = mod.default || mod
      const { nodes, links } = buildGraphData(model)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const THREE = await import('three')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const graph: any = ForceGraph3D()(containerRef.current)
      graph.graphData({ nodes, links })
        .backgroundColor('#F8F8F7')
        .nodeLabel((node: GraphNode) => `
          <div style="background:rgba(0,0,0,0.85);color:white;padding:8px 12px;border-radius:8px;font-family:DM Sans Variable,sans-serif;max-width:280px;font-size:12px;line-height:1.5">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;opacity:0.6;margin-bottom:2px">${TYPE_LABELS[node.type] ?? node.type}</div>
            <div style="font-weight:600;margin-bottom:4px">${node.name}</div>
            <div style="opacity:0.8">${node.description}</div>
          </div>
        `)
        .nodeVal((node: GraphNode) => node.val)
        .nodeThreeObject((node: GraphNode) => {
          const color = TYPE_COLORS[node.type] ?? '#888'

          // Create a group to hold sphere + label
          const group = new THREE.Group()

          // Sphere
          const radius = Math.cbrt(node.val) * 2
          const geometry = new THREE.SphereGeometry(radius, 16, 12)
          const material = new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.9 })
          const sphere = new THREE.Mesh(geometry, material)
          group.add(sphere)

          // Text label — short name truncated
          const shortName = node.name.length > 18 ? node.name.slice(0, 16) + '…' : node.name
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          canvas.width = 256
          canvas.height = 48
          ctx.font = 'bold 22px sans-serif'
          ctx.fillStyle = '#34322D'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(shortName, 128, 24)

          const texture = new THREE.CanvasTexture(canvas)
          texture.needsUpdate = true
          const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
          const sprite = new THREE.Sprite(spriteMat)
          sprite.scale.set(24, 4.5, 1)
          sprite.position.set(0, radius + 4, 0)
          group.add(sprite)

          return group
        })
        .nodeThreeObjectExtend(false)
        .linkColor((link: GraphLink) => {
          if (link.type === 'entity-entity') return '#9CA3AF'
          if (link.type === 'rule-entity') return '#F59E0B66'
          if (link.type === 'journey-actor') return '#10B98166'
          if (link.type === 'constraint-entity') return '#EF444466'
          if (link.type === 'question-entity') return '#EC489966'
          return '#85848144'
        })
        .linkWidth((link: GraphLink) => link.type === 'entity-entity' ? 2 : 1)
        .linkOpacity(0.4)
        .linkDirectionalParticles(1)
        .linkDirectionalParticleSpeed(0.005)
        .onNodeClick(handleNodeClick)
        .onNodeHover((node: GraphNode | null) => setHoveredNode(node))

      // Tighter forces — bring nodes closer together
      const charge = graph.d3Force('charge')
      if (charge?.strength) charge.strength(-80)
      const link = graph.d3Force('link')
      if (link?.distance) link.distance(30)
      const center = graph.d3Force('center')
      if (center?.strength) center.strength(1.5)

      const rect = containerRef.current.getBoundingClientRect()
      graph.width(rect.width).height(rect.height)

      graphRef.current = graph

      // Handle resize
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          graph.width(entry.contentRect.width).height(entry.contentRect.height)
        }
      })
      resizeObserver.observe(containerRef.current)

      return () => {
        resizeObserver.disconnect()
      }
    })

    return () => {
      destroyed = true
      if (graphRef.current?._destructor) {
        graphRef.current._destructor()
      }
      graphRef.current = null
    }
  }, [model, handleNodeClick])

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {/* Category toggles */}
      <div
        className="absolute bottom-4 left-4 flex items-center gap-1 rounded-xl px-3 py-2"
        style={{
          background: 'var(--bg-white)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-float)',
        }}
      >
        {ALL_TYPES.map(type => {
          const color = TYPE_COLORS[type]
          const isHidden = hiddenTypes.has(type)
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-200"
              style={{
                opacity: isHidden ? 0.35 : 1,
                background: isHidden ? 'transparent' : `${color}12`,
              }}
              title={`${isHidden ? 'Show' : 'Hide'} ${TYPE_LABELS[type]}s`}
            >
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              <span className="text-[11px] font-medium" style={{ color: isHidden ? 'var(--text-muted)' : color }}>
                {TYPE_LABELS[type]}
              </span>
            </button>
          )
        })}
        <div className="mx-1 h-4 w-px" style={{ background: 'var(--border-default)' }} />
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="text-[11px] font-medium px-2 py-1 rounded-lg transition-colors duration-200"
          style={{ color: showFilters ? 'var(--accent-blue)' : 'var(--text-muted)' }}
        >
          {showFilters ? '▾ Nodes' : '▸ Nodes'}
        </button>
      </div>

      {/* Individual node toggles */}
      {showFilters && (
        <div
          className="absolute bottom-16 left-4 rounded-xl overflow-hidden"
          style={{
            width: 260,
            background: 'var(--bg-white)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-overlay)',
          }}
        >
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}>
            Toggle individual nodes
          </div>
          <div>
            {ALL_TYPES.filter(type => !hiddenTypes.has(type)).map(type => {
              const color = TYPE_COLORS[type]
              const nodesOfType = fullGraphData.current.nodes.filter(n => n.type === type)
              if (nodesOfType.length === 0) return null
              return (
                <div key={type}>
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color, background: `${color}08` }}>
                    {TYPE_LABELS[type]}s
                  </div>
                  {nodesOfType.map(node => {
                    const isHidden = hiddenNodes.has(node.id)
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => toggleNode(node.id)}
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-left transition-all duration-150 hover:bg-[var(--bg-gray-subtle)]"
                        style={{ opacity: isHidden ? 0.4 : 1 }}
                      >
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ background: isHidden ? 'var(--text-muted)' : color }}
                        />
                        <span className="text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>
                          {node.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected node detail */}
      {selectedNode && (
        <div
          className="absolute top-4 right-4 rounded-xl p-4"
          style={{
            width: 340,
            background: 'var(--bg-white)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-overlay)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md"
              style={{ background: `${TYPE_COLORS[selectedNode.type]}18`, color: TYPE_COLORS[selectedNode.type] }}
            >
              {TYPE_LABELS[selectedNode.type]}
            </span>
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="ml-auto text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          </div>
          <h3 className="text-sm font-semibold m-0 mb-1" style={{ color: 'var(--text-primary)' }}>
            {selectedNode.name}
          </h3>
          <p className="text-xs leading-relaxed m-0" style={{ color: 'var(--text-secondary)' }}>
            {selectedNode.description}
          </p>
        </div>
      )}
    </div>
  )
}
