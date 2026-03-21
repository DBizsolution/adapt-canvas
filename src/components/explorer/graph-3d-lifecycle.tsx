'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import type { IntentModel } from '@/domain/intent-model/types'

// HBL lifecycle is the spine — everything branches from milestone states
// Layout: states along Z axis, actors/journeys/rules branch out at the state where they activate

type LifecycleNode = {
  id: string
  name: string
  type: 'milestone' | 'entity' | 'actor' | 'journey' | 'rule' | 'constraint'
  description: string
  val: number
  fx?: number  // fixed position
  fy?: number
  fz?: number
}

type LifecycleLink = {
  source: string
  target: string
  type: 'spine' | 'activates' | 'governs'
}

const LIFECYCLE_COLORS: Record<string, string> = {
  milestone: '#002C61',
  entity: '#0081F2',
  actor: '#8B5CF6',
  journey: '#10B981',
  rule: '#F59E0B',
  constraint: '#EF4444',
}

const LIFECYCLE_LABELS: Record<string, string> = {
  milestone: 'Milestone',
  entity: 'Entity',
  actor: 'Actor',
  journey: 'Journey',
  rule: 'Rule',
  constraint: 'Constraint',
}

function buildLifecycleData(model: IntentModel): { nodes: LifecycleNode[]; links: LifecycleLink[] } {
  const nodes: LifecycleNode[] = []
  const links: LifecycleLink[] = []

  const hbl = model.entities.find(e => e.id === 'hbl')
  if (!hbl) return { nodes, links }

  const states = hbl.lifecycle.states
  const stateSpacing = 80

  // Milestone nodes along the Z axis (spine)
  for (let i = 0; i < states.length; i++) {
    nodes.push({
      id: `milestone:${states[i]}`,
      name: states[i].replace(/_/g, ' '),
      type: 'milestone',
      description: `HBL milestone ${i + 1} of ${states.length}`,
      val: 20,
      fx: 0,
      fy: 0,
      fz: i * stateSpacing,
    })

    // Spine edges
    if (i > 0) {
      links.push({
        source: `milestone:${states[i - 1]}`,
        target: `milestone:${states[i]}`,
        type: 'spine',
      })
    }
  }

  // Helper: which milestone does a text reference?
  const mentionsMilestone = (text: string): string[] => {
    const lower = text.toLowerCase()
    return states.filter(s => lower.includes(s.replace(/_/g, ' ')) || lower.includes(s))
  }

  // Helper: does the text mention booking readiness (unpacked + customs cleared)?
  const mentionsBookingReadiness = (text: string): boolean => {
    const lower = text.toLowerCase()
    return lower.includes('unpacked') || lower.includes('booking readiness') || lower.includes('book pickup')
  }

  // Helper: does text mention collection/pickup verification?
  const mentionsCollection = (text: string): boolean => {
    const lower = text.toLowerCase()
    return lower.includes('collected') || lower.includes('pickup verification') || lower.includes('gatehouse')
  }

  // Place entities at relevant milestones
  const booking = model.entities.find(e => e.id === 'booking')
  if (booking) {
    nodes.push({
      id: 'entity:booking',
      name: 'Booking',
      type: 'entity',
      description: booking.description.slice(0, 120),
      val: 15,
      fx: 40,
      fy: 20,
      fz: 3 * stateSpacing, // unpacked — where bookings happen
    })
    links.push({ source: 'milestone:unpacked', target: 'entity:booking', type: 'activates' })
  }

  const slot = model.entities.find(e => e.id === 'slot')
  if (slot) {
    nodes.push({
      id: 'entity:slot',
      name: 'Pickup Slot',
      type: 'entity',
      description: slot.description.slice(0, 120),
      val: 12,
      fx: 50,
      fy: -25,
      fz: 3 * stateSpacing,
    })
    links.push({ source: 'entity:booking', target: 'entity:slot', type: 'activates' })
  }

  const doEntity = model.entities.find(e => e.id === 'delivery_order')
  if (doEntity) {
    nodes.push({
      id: 'entity:delivery_order',
      name: 'Delivery Order',
      type: 'entity',
      description: doEntity.description.slice(0, 120),
      val: 12,
      fx: -45,
      fy: 20,
      fz: 2.5 * stateSpacing,
    })
    links.push({ source: 'milestone:in_yard', target: 'entity:delivery_order', type: 'activates' })
  }

  const delegation = model.entities.find(e => e.id === 'delegation')
  if (delegation) {
    nodes.push({
      id: 'entity:delegation',
      name: 'Delegation',
      type: 'entity',
      description: delegation.description.slice(0, 120),
      val: 12,
      fx: -40,
      fy: -20,
      fz: 0.5 * stateSpacing, // can happen at any milestone
    })
    links.push({ source: 'milestone:on_vessel', target: 'entity:delegation', type: 'activates' })
  }

  // Place actors — position based on when they're most active
  let actorIndex = 0
  for (const actor of model.actors) {
    const angle = (actorIndex / model.actors.length) * Math.PI * 2
    const r = 55

    // Determine Z position based on responsibilities
    const allText = actor.responsibilities.map(r => r.description).join(' ')
    let zPos = 1.5 * stateSpacing // default: middle

    if (mentionsBookingReadiness(allText)) zPos = 3 * stateSpacing
    else if (mentionsCollection(allText)) zPos = 4 * stateSpacing
    else if (allText.toLowerCase().includes('assign')) zPos = 0.5 * stateSpacing
    else if (allText.toLowerCase().includes('slot config')) zPos = 2 * stateSpacing

    nodes.push({
      id: `actor:${actor.id}`,
      name: actor.name,
      type: 'actor',
      description: actor.description.slice(0, 120),
      val: 12,
      fx: Math.cos(angle) * r,
      fy: Math.sin(angle) * r,
      fz: zPos,
    })

    // Link to nearest milestone
    const nearestIdx = Math.round(zPos / stateSpacing)
    const clampedIdx = Math.max(0, Math.min(states.length - 1, nearestIdx))
    links.push({ source: `actor:${actor.id}`, target: `milestone:${states[clampedIdx]}`, type: 'activates' })

    actorIndex++
  }

  // Place journeys near their relevant milestone
  let journeyIndex = 0
  for (const journey of model.journeys) {
    const allText = journey.steps.map(s => s.detail).join(' ') + ' ' + journey.name
    const angle = (journeyIndex / model.journeys.length) * Math.PI * 2 + 0.3
    const r = 70

    let zPos = 2 * stateSpacing
    if (mentionsBookingReadiness(allText)) zPos = 3 * stateSpacing
    else if (mentionsCollection(allText)) zPos = 4 * stateSpacing
    else if (allText.toLowerCase().includes('delegat')) zPos = 1 * stateSpacing
    else if (allText.toLowerCase().includes('slot') || allText.toLowerCase().includes('configur')) zPos = 2 * stateSpacing
    else if (allText.toLowerCase().includes('cancel')) zPos = 3.5 * stateSpacing
    else if (allText.toLowerCase().includes('user') || allText.toLowerCase().includes('creates')) zPos = 0 * stateSpacing

    nodes.push({
      id: `journey:${journey.id}`,
      name: journey.name,
      type: 'journey',
      description: `${journey.steps.length} steps — ${journey.success_outcome.slice(0, 80)}`,
      val: 10,
      fx: Math.cos(angle) * r,
      fy: Math.sin(angle) * r,
      fz: zPos,
    })

    // Link to primary actor
    links.push({ source: `journey:${journey.id}`, target: `actor:${journey.primary_actor}`, type: 'activates' })

    journeyIndex++
  }

  // Place rules at the milestone they most relate to
  let ruleIndex = 0
  for (const rule of model.business_rules) {
    const text = rule.description
    const angle = (ruleIndex / model.business_rules.length) * Math.PI * 2 + 0.6
    const r = 90

    let zPos = 2 * stateSpacing
    if (mentionsBookingReadiness(text)) zPos = 3 * stateSpacing
    else if (mentionsCollection(text)) zPos = 4 * stateSpacing
    else if (text.toLowerCase().includes('delegat')) zPos = 1 * stateSpacing
    else if (text.toLowerCase().includes('do ') || text.toLowerCase().includes('delivery order')) zPos = 2.5 * stateSpacing
    else if (text.toLowerCase().includes('cutoff') || text.toLowerCase().includes('slot')) zPos = 3 * stateSpacing
    else if (text.toLowerCase().includes('cancel')) zPos = 3.5 * stateSpacing
    else if (text.toLowerCase().includes('fee') || text.toLowerCase().includes('payment')) zPos = 3.2 * stateSpacing

    nodes.push({
      id: `rule:${rule.id}`,
      name: rule.id,
      type: 'rule',
      description: rule.description.slice(0, 120),
      val: 8,
      fx: Math.cos(angle) * r,
      fy: Math.sin(angle) * r,
      fz: zPos,
    })

    // Link to applies_to entities/actors
    for (const ref of rule.applies_to) {
      if (nodes.some(n => n.id === `entity:${ref}`)) {
        links.push({ source: `rule:${rule.id}`, target: `entity:${ref}`, type: 'governs' })
      } else if (nodes.some(n => n.id === `actor:${ref}`)) {
        links.push({ source: `rule:${rule.id}`, target: `actor:${ref}`, type: 'governs' })
      }
    }

    ruleIndex++
  }

  return { nodes, links }
}

export function Graph3DLifecycle({ model }: { model: IntentModel }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedNode, setSelectedNode] = useState<LifecycleNode | null>(null)

  const handleNodeClick = useCallback((node: LifecycleNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    let destroyed = false

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import('3d-force-graph').then(async (mod: any) => {
      if (destroyed || !containerRef.current) return

      const ForceGraph3D = mod.default || mod
      const THREE = await import('three')
      const { nodes, links } = buildLifecycleData(model)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const graph: any = ForceGraph3D()(containerRef.current)
      graph.graphData({ nodes, links })
        .backgroundColor('#F8F8F7')
        .nodeLabel((node: LifecycleNode) => `
          <div style="background:rgba(0,0,0,0.9);color:white;padding:10px 14px;border-radius:10px;font-family:DM Sans Variable,sans-serif;max-width:280px;font-size:12px;line-height:1.5;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.3)">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;opacity:0.6;margin-bottom:2px">${LIFECYCLE_LABELS[node.type] ?? node.type}</div>
            <div style="font-weight:600;margin-bottom:4px">${node.name}</div>
            <div style="opacity:0.8">${node.description}</div>
          </div>
        `)
        .nodeThreeObject((node: LifecycleNode) => {
          const color = LIFECYCLE_COLORS[node.type] ?? '#888'
          const group = new THREE.Group()

          const radius = node.type === 'milestone'
            ? 8
            : 4 + Math.min(node.val, 15) * 0.3
          const geometry = new THREE.SphereGeometry(radius, 16, 12)
          const material = new THREE.MeshLambertMaterial({
            color,
            transparent: true,
            opacity: node.type === 'milestone' ? 1 : 0.85,
          })
          group.add(new THREE.Mesh(geometry, material))

          // Label
          const scale = 2
          const canvasW = 512 * scale
          const canvasH = 64 * scale
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          canvas.width = canvasW
          canvas.height = canvasH
          ctx.font = `${node.type === 'milestone' ? '700' : '600'} ${22 * scale}px system-ui, -apple-system, sans-serif`
          ctx.fillStyle = node.type === 'milestone' ? '#002C61' : '#34322D'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          const displayName = node.name.length > 24 ? node.name.slice(0, 22) + '…' : node.name
          ctx.fillText(displayName, canvasW / 2, canvasH / 2)

          const texture = new THREE.CanvasTexture(canvas)
          const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
          const sprite = new THREE.Sprite(spriteMat)
          const spriteW = node.type === 'milestone' ? 32 : 24
          sprite.scale.set(spriteW, spriteW * (canvasH / canvasW), 1)
          sprite.position.set(0, radius + 4, 0)
          group.add(sprite)

          return group
        })
        .nodeThreeObjectExtend(false)
        .linkColor((link: LifecycleLink) => {
          if (link.type === 'spine') return '#002C61'
          if (link.type === 'governs') return '#F59E0B44'
          return '#85848133'
        })
        .linkWidth((link: LifecycleLink) => link.type === 'spine' ? 4 : 1)
        .linkOpacity(0.5)
        .linkDirectionalParticles(0)
        .linkDirectionalParticleWidth(3)
        .linkDirectionalParticleSpeed(0.008)
        .linkDirectionalParticleColor((link: LifecycleLink) => {
          if (link.type === 'spine') return '#002C61'
          return '#0081F2'
        })
        .onNodeClick((node: LifecycleNode) => {
          handleNodeClick(node)

          // Emit particles on direct edges
          const graphData = graph.graphData()
          const getNodeId = (n: unknown) => typeof n === 'string' ? n : (n as LifecycleNode)?.id ?? ''
          const directLinks = graphData.links.filter((l: any) => {
            const src = getNodeId(l.source)
            const tgt = getNodeId(l.target)
            return src === node.id || tgt === node.id
          })
          for (let i = 0; i < directLinks.length; i++) {
            setTimeout(() => graph.emitParticle(directLinks[i]), i * 80)
          }
        })

      // No live simulation — all positions are fixed
      graph.warmupTicks(50)
      graph.cooldownTicks(0)
      graph.d3VelocityDecay(0.9)

      // Disable forces since positions are fixed
      graph.d3Force('charge', null)
      graph.d3Force('link', null)

      // Fix tooltip container
      const style = document.createElement('style')
      style.textContent = '.graph-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }'
      containerRef.current.appendChild(style)

      const rect = containerRef.current.getBoundingClientRect()
      graph.width(rect.width).height(rect.height)

      // Point camera along the spine (Z axis)
      graph.cameraPosition({ x: 100, y: 60, z: 150 }, { x: 0, y: 0, z: 160 })

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

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl px-4 py-2.5"
        style={{
          background: 'var(--bg-white)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-float)',
        }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          HBL Lifecycle
        </span>
        {Object.entries(LIFECYCLE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {LIFECYCLE_LABELS[type]}
            </span>
          </div>
        ))}
      </div>

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
              style={{ background: `${LIFECYCLE_COLORS[selectedNode.type]}18`, color: LIFECYCLE_COLORS[selectedNode.type] }}
            >
              {LIFECYCLE_LABELS[selectedNode.type]}
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
