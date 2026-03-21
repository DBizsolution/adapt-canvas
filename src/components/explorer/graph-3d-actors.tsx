'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import type { IntentModel } from '@/domain/intent-model/types'

// Actor Layers: each actor is a horizontal plane/platform at a different Y height.
// Journeys connect actors as vertical bridges. Entities sit in the middle as shared objects.
// Rules float near the entities they govern.

type LayerNode = {
  id: string
  name: string
  type: 'actor' | 'entity' | 'journey' | 'rule' | 'constraint'
  description: string
  val: number
  fx: number
  fy: number
  fz: number
}

type LayerLink = {
  source: string
  target: string
}

const LAYER_COLORS: Record<string, string> = {
  actor: '#8B5CF6',
  entity: '#0081F2',
  journey: '#10B981',
  rule: '#9CA3AF',
  constraint: '#EF4444',
}

const LAYER_LABELS: Record<string, string> = {
  actor: 'Actor',
  entity: 'Entity',
  journey: 'Journey',
  rule: 'Rule',
  constraint: 'Constraint',
}

// Actor layer heights — spaced vertically
const ACTOR_LAYERS: Record<string, number> = {
  acfs: 60,
  gatehouse: 40,
  lsp: 0,
  p4tc: -30,
  driver: -55,
}

const LAYER_SPACING_X = 30

function buildActorLayerData(model: IntentModel): { nodes: LayerNode[]; links: LayerLink[] } {
  const nodes: LayerNode[] = []
  const links: LayerLink[] = []

  // Actor nodes — positioned at their layer height, spread along X
  for (const actor of model.actors) {
    const y = ACTOR_LAYERS[actor.id] ?? 0
    nodes.push({
      id: `actor:${actor.id}`,
      name: actor.name,
      type: 'actor',
      description: actor.description.slice(0, 120),
      val: 12,
      fx: -60,
      fy: y,
      fz: 0,
    })
  }

  // Entities — centered between layers, spread along X and Z
  const mainEntities = ['hbl', 'booking', 'slot', 'delivery_order', 'delegation', 'driver_record']
  let entityIdx = 0
  for (const eid of mainEntities) {
    const entity = model.entities.find(e => e.id === eid)
    if (!entity) continue
    const col = entityIdx % 3
    const row = Math.floor(entityIdx / 3)
    nodes.push({
      id: `entity:${eid}`,
      name: entity.name,
      type: 'entity',
      description: entity.description.slice(0, 120),
      val: 14,
      fx: col * LAYER_SPACING_X,
      fy: 15,
      fz: row * LAYER_SPACING_X - 15,
    })

    // Link entities to actors that reference them
    for (const actor of model.actors) {
      const mentions = actor.responsibilities.some(r => {
        const l = r.description.toLowerCase()
        const names = [eid, entity.name.toLowerCase()]
        const abbr = entity.name.match(/\(([A-Z]+)\)/)
        if (abbr) names.push(abbr[1].toLowerCase())
        return names.some(n => l.includes(n))
      })
      if (mentions) {
        links.push({ source: `actor:${actor.id}`, target: `entity:${eid}` })
      }
    }
    entityIdx++
  }

  // Journeys — positioned between their actor's layer and the entity layer
  let journeyIdx = 0
  for (const journey of model.journeys) {
    const actorY = ACTOR_LAYERS[journey.primary_actor] ?? 0
    const midY = (actorY + 15) / 2
    const angle = (journeyIdx / model.journeys.length) * Math.PI * 2
    const r = 25

    nodes.push({
      id: `journey:${journey.id}`,
      name: journey.name,
      type: 'journey',
      description: `${journey.steps.length} steps — ${journey.success_outcome.slice(0, 80)}`,
      val: 10,
      fx: 60 + Math.cos(angle) * r,
      fy: midY,
      fz: Math.sin(angle) * r,
    })

    // Link journey to its actor
    links.push({ source: `journey:${journey.id}`, target: `actor:${journey.primary_actor}` })

    // Link journey to entities it mentions
    for (const eid of mainEntities) {
      const entity = model.entities.find(e => e.id === eid)
      if (!entity) continue
      const names = [eid, entity.name.toLowerCase()]
      const abbr = entity.name.match(/\(([A-Z]+)\)/)
      if (abbr) names.push(abbr[1].toLowerCase())
      const text = journey.steps.map(s => s.detail).join(' ').toLowerCase()
      if (names.some(n => text.includes(n))) {
        links.push({ source: `journey:${journey.id}`, target: `entity:${eid}` })
      }
    }

    journeyIdx++
  }

  // Rules — small, spread on the right side
  let ruleIdx = 0
  for (const rule of model.business_rules) {
    const angle = (ruleIdx / model.business_rules.length) * Math.PI * 2
    const r = 40
    nodes.push({
      id: `rule:${rule.id}`,
      name: rule.id,
      type: 'rule',
      description: rule.description.slice(0, 120),
      val: 8,
      fx: -40 + Math.cos(angle) * r,
      fy: -20 + Math.sin(angle) * 30,
      fz: 40 + Math.sin(angle) * r,
    })

    for (const ref of rule.applies_to) {
      if (nodes.some(n => n.id === `entity:${ref}`))
        links.push({ source: `rule:${rule.id}`, target: `entity:${ref}` })
      else if (nodes.some(n => n.id === `actor:${ref}`))
        links.push({ source: `rule:${rule.id}`, target: `actor:${ref}` })
    }
    ruleIdx++
  }

  return { nodes, links }
}

const TOGGLEABLE = ['entity', 'actor', 'journey', 'rule', 'constraint'] as const

export function Graph3DActors({ model }: { model: IntentModel }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedNode, setSelectedNode] = useState<LayerNode | null>(null)
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set())
  const graphRef = useRef<any>(null)
  const fullData = useRef(buildActorLayerData(model))

  const toggleType = useCallback((type: string) => {
    setHiddenTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const handleNodeClick = useCallback((node: LayerNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node)
  }, [])

  // Toggle visibility of connection lines
  useEffect(() => {
    if (!graphRef.current) return
    const graph = graphRef.current as any
    const { nodes } = fullData.current
    const visibleNodes = nodes.filter(n => !hiddenTypes.has(n.type))
    graph.graphData({ nodes: visibleNodes, links: [] })

    const lines = graph.__connectionLines as Array<{ mesh: any; sourceType: string; targetType: string }> | undefined
    if (lines) {
      for (const line of lines) {
        line.mesh.visible = !hiddenTypes.has(line.sourceType) && !hiddenTypes.has(line.targetType)
      }
    }
  }, [hiddenTypes])

  useEffect(() => {
    if (!containerRef.current) return
    let destroyed = false

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import('3d-force-graph').then(async (mod: any) => {
      if (destroyed || !containerRef.current) return

      const ForceGraph3D = mod.default || mod
      const THREE = await import('three')
      const { nodes, links } = buildActorLayerData(model)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const graph: any = ForceGraph3D()(containerRef.current)

      // --- Actor layer platforms ---
      const platformMat = new THREE.MeshLambertMaterial({ color: '#8B5CF6', transparent: true, opacity: 0.08 })
      for (const actor of model.actors) {
        const y = ACTOR_LAYERS[actor.id] ?? 0
        const platform = new THREE.Mesh(new THREE.BoxGeometry(180, 0.5, 100), platformMat)
        platform.position.set(0, y - 2, 0)
        graph.scene().add(platform)

        // Actor name on the platform
        const labelCanvas = document.createElement('canvas')
        labelCanvas.width = 1024
        labelCanvas.height = 128
        const ctx = labelCanvas.getContext('2d')!
        ctx.font = 'bold 48px system-ui, sans-serif'
        ctx.fillStyle = 'rgba(139,92,246,0.25)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(actor.name.toUpperCase(), 512, 64)
        const tex = new THREE.CanvasTexture(labelCanvas)
        const labelMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
        const label = new THREE.Mesh(new THREE.PlaneGeometry(80, 10), labelMat)
        label.rotation.x = -Math.PI / 2
        label.position.set(0, y - 1.5, -40)
        graph.scene().add(label)
      }

      // --- Connection lines as cylinders ---
      const tubeMat = new THREE.MeshBasicMaterial({ color: '#AAAAAA' })
      const nodePositions = new Map<string, { x: number; y: number; z: number }>()
      const nodeTypeMap = new Map<string, string>()
      for (const n of nodes) {
        nodePositions.set(n.id, { x: n.fx, y: n.fy, z: n.fz })
        nodeTypeMap.set(n.id, n.type)
      }

      type CLine = { mesh: import('three').Mesh; sourceType: string; targetType: string }
      const connectionLines: CLine[] = []

      for (const link of links) {
        const srcPos = nodePositions.get(link.source)
        const tgtPos = nodePositions.get(link.target)
        if (!srcPos || !tgtPos) continue

        const start = new THREE.Vector3(srcPos.x, srcPos.y, srcPos.z)
        const end = new THREE.Vector3(tgtPos.x, tgtPos.y, tgtPos.z)
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
        const length = start.distanceTo(end)

        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, length, 4, 1), tubeMat)
        cyl.position.copy(mid)
        cyl.lookAt(end)
        cyl.rotateX(Math.PI / 2)
        graph.scene().add(cyl)
        connectionLines.push({
          mesh: cyl,
          sourceType: nodeTypeMap.get(link.source) ?? '',
          targetType: nodeTypeMap.get(link.target) ?? '',
        })
      }
      ;(graph as any).__connectionLines = connectionLines

      // --- Graph setup ---
      graph.graphData({ nodes, links: [] })
        .backgroundColor('#F8F8F7')
        .nodeLabel((node: LayerNode) => `
          <div style="background:rgba(0,0,0,0.9);color:white;padding:10px 14px;border-radius:10px;font-family:DM Sans Variable,sans-serif;max-width:280px;font-size:12px;line-height:1.5;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.3)">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;opacity:0.6;margin-bottom:2px">${LAYER_LABELS[node.type]}</div>
            <div style="font-weight:600;margin-bottom:4px">${node.name}</div>
            <div style="opacity:0.8">${node.description}</div>
          </div>
        `)
        .nodeThreeObject((node: LayerNode) => {
          const color = LAYER_COLORS[node.type]
          const group = new THREE.Group()
          let topY = 4

          if (node.type === 'actor') {
            // Person icon
            const mat = new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide })
            const head = new THREE.Mesh(new THREE.SphereGeometry(2, 12, 12), mat)
            head.position.set(0, 4, 0)
            group.add(head)
            const bodyGeo = new THREE.SphereGeometry(3.2, 12, 12)
            bodyGeo.scale(1, 0.6, 0.8)
            group.add(new THREE.Mesh(bodyGeo, mat))
            group.children[group.children.length - 1].position.set(0, 1, 0)
            const neck = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 1, 12), mat)
            neck.position.set(0, 2.5, 0)
            group.add(neck)
            topY = 7.5
          } else if (node.type === 'journey') {
            // Cursor arrow
            const mat = new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide })
            const shape = new THREE.Shape()
            shape.moveTo(0, 6)
            shape.lineTo(-1.8, 1.5)
            shape.lineTo(-0.8, 1.8)
            shape.lineTo(-2.2, -1)
            shape.lineTo(-1, -0.5)
            shape.lineTo(0, 2)
            shape.lineTo(1, -0.5)
            shape.lineTo(2.2, -1)
            shape.lineTo(0.8, 1.8)
            shape.lineTo(1.8, 1.5)
            shape.lineTo(0, 6)
            const geo = new THREE.ExtrudeGeometry(shape, { depth: 1.5, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.15, bevelSegments: 2 })
            geo.translate(0, -3, -0.75)
            group.add(new THREE.Mesh(geo, mat))
            topY = 5
          } else if (node.type === 'rule') {
            // Gray sphere
            group.add(new THREE.Mesh(new THREE.SphereGeometry(3, 12, 12), new THREE.MeshLambertMaterial({ color })))
            topY = 4.5
          } else if (node.type === 'constraint') {
            // Octahedron
            group.add(new THREE.Mesh(new THREE.OctahedronGeometry(3, 0), new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide })))
            topY = 5
          } else {
            // Entity sphere
            const radius = Math.max(3, 2 + Math.min(node.val, 15) * 0.2)
            group.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 12), new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide })))
            topY = radius + 2
          }

          // Label
          const canvasW = 1024
          const canvasH = 128
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          canvas.width = canvasW
          canvas.height = canvasH
          ctx.font = '600 44px system-ui, -apple-system, sans-serif'
          ctx.fillStyle = '#34322D'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const name = node.name.length > 20 ? node.name.slice(0, 18) + '…' : node.name
          ctx.fillText(name, canvasW / 2, canvasH / 2)
          const texture = new THREE.CanvasTexture(canvas)
          const labelMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
          const label = new THREE.Sprite(labelMat)
          label.scale.set(22, 22 * (canvasH / canvasW), 1)
          label.position.set(0, topY + 1.5, 0)
          group.add(label)

          return group
        })
        .nodeThreeObjectExtend(false)
        .linkWidth(0)
        .linkOpacity(0)
        .onNodeClick((node: LayerNode) => {
          handleNodeClick(node)
          // Emit particles on direct connection lines (visual pulse)
        })

      graph.warmupTicks(100)
      graph.cooldownTicks(0)
      graph.d3VelocityDecay(0.9)
      graph.d3Force('charge', null)
      graph.d3Force('link', null)

      // Tooltip fix
      const style = document.createElement('style')
      style.textContent = '.graph-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }'
      containerRef.current.appendChild(style)

      const rect = containerRef.current.getBoundingClientRect()
      graph.width(rect.width).height(rect.height)

      // Camera: isometric looking at the layer stack
      graph.cameraPosition({ x: 120, y: 80, z: 120 }, { x: 0, y: 10, z: 0 })

      graphRef.current = graph

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          graph.width(entry.contentRect.width).height(entry.contentRect.height)
        }
      })
      resizeObserver.observe(containerRef.current)
    })

    return () => { destroyed = true }
  }, [model, handleNodeClick])

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      <div
        className="absolute bottom-4 left-4 flex items-center gap-1 rounded-xl px-3 py-2"
        style={{ background: 'var(--bg-white)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-float)' }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider mr-2" style={{ color: 'var(--text-muted)' }}>
          Actor Layers
        </span>
        {TOGGLEABLE.map(type => {
          const color = LAYER_COLORS[type]
          const isHidden = hiddenTypes.has(type)
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-all duration-200"
              style={{ opacity: isHidden ? 0.3 : 1, background: isHidden ? 'transparent' : `${color}12` }}
            >
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              <span className="text-[11px] font-medium" style={{ color: isHidden ? 'var(--text-muted)' : color }}>{LAYER_LABELS[type]}</span>
            </button>
          )
        })}
      </div>

      {selectedNode && (
        <div
          className="absolute top-4 right-4 rounded-xl p-4"
          style={{ width: 340, background: 'var(--bg-white)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-overlay)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md"
              style={{ background: `${LAYER_COLORS[selectedNode.type]}18`, color: LAYER_COLORS[selectedNode.type] }}
            >
              {LAYER_LABELS[selectedNode.type]}
            </span>
            <button type="button" onClick={() => setSelectedNode(null)} className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>✕</button>
          </div>
          <h3 className="text-sm font-semibold m-0 mb-1" style={{ color: 'var(--text-primary)' }}>{selectedNode.name}</h3>
          <p className="text-xs leading-relaxed m-0" style={{ color: 'var(--text-secondary)' }}>{selectedNode.description}</p>
        </div>
      )}
    </div>
  )
}
