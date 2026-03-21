'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import type { IntentModel } from '@/domain/intent-model/types'

type LifecycleNode = {
  id: string
  name: string
  type: 'milestone' | 'entity' | 'actor' | 'journey' | 'rule' | 'constraint'
  description: string
  val: number
  fx?: number
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

// Milestone icons — drawn on canvas
const MILESTONE_ICONS: Record<string, { emoji: string; label: string }> = {
  on_vessel: { emoji: '🚢', label: 'On Vessel' },
  at_wharf: { emoji: '⚓', label: 'At Wharf' },
  in_yard: { emoji: '📦', label: 'In Yard' },
  unpacked: { emoji: '📂', label: 'Unpacked' },
  collected: { emoji: '🚛', label: 'Collected' },
}

const SPINE_SPACING = 100

function buildLifecycleData(model: IntentModel): { nodes: LifecycleNode[]; links: LifecycleLink[] } {
  const nodes: LifecycleNode[] = []
  const links: LifecycleLink[] = []

  const hbl = model.entities.find(e => e.id === 'hbl')
  if (!hbl) return { nodes, links }

  const states = hbl.lifecycle.states

  // Milestone nodes along X axis
  for (let i = 0; i < states.length; i++) {
    const icon = MILESTONE_ICONS[states[i]]
    nodes.push({
      id: `milestone:${states[i]}`,
      name: icon?.label ?? states[i],
      type: 'milestone',
      description: `HBL milestone ${i + 1} of ${states.length}`,
      val: 25,
      fx: i * SPINE_SPACING,
      fy: 0,
      fz: 0,
    })

    if (i > 0) {
      links.push({ source: `milestone:${states[i - 1]}`, target: `milestone:${states[i]}`, type: 'spine' })
    }
  }

  const mentionsBooking = (text: string) => {
    const l = text.toLowerCase()
    return l.includes('unpacked') || l.includes('booking readiness') || l.includes('book pickup') || l.includes('book a pickup')
  }
  const mentionsCollection = (text: string) => {
    const l = text.toLowerCase()
    return l.includes('collected') || l.includes('pickup verification') || l.includes('gatehouse') || l.includes('verifies pickup')
  }
  const mentionsDelegation = (text: string) => text.toLowerCase().includes('delegat')
  const mentionsSlotConfig = (text: string) => {
    const l = text.toLowerCase()
    return l.includes('slot config') || l.includes('configures pickup') || l.includes('configure slot')
  }
  const mentionsDO = (text: string) => {
    const l = text.toLowerCase()
    return l.includes('delivery order') || l.includes('validates do') || l.includes('do validation')
  }
  const mentionsCancel = (text: string) => text.toLowerCase().includes('cancel')
  const mentionsUser = (text: string) => {
    const l = text.toLowerCase()
    return l.includes('creates a user') || l.includes('user management') || l.includes('removes a user') || l.includes('updates a user')
  }

  const getZPosition = (text: string, defaultZ: number): number => {
    if (mentionsBooking(text)) return 3 * SPINE_SPACING
    if (mentionsCollection(text)) return 4 * SPINE_SPACING
    if (mentionsDelegation(text)) return 0.5 * SPINE_SPACING
    if (mentionsSlotConfig(text)) return 2.5 * SPINE_SPACING
    if (mentionsDO(text)) return 2.5 * SPINE_SPACING
    if (mentionsCancel(text)) return 3.5 * SPINE_SPACING
    if (mentionsUser(text)) return -0.3 * SPINE_SPACING
    return defaultZ
  }

  // Key entities
  const entityPlacements: { id: string; name: string; y: number; z: number; milestoneIdx: number }[] = [
    { id: 'booking', name: 'Booking', y: 35, z: 20, milestoneIdx: 3 },
    { id: 'slot', name: 'Pickup Slot', y: 40, z: -25, milestoneIdx: 3 },
    { id: 'delivery_order', name: 'Delivery Order', y: -35, z: 20, milestoneIdx: 2 },
    { id: 'delegation', name: 'Delegation', y: -30, z: -20, milestoneIdx: 0 },
    { id: 'driver_record', name: 'Driver Record', y: 30, z: -30, milestoneIdx: 3 },
  ]

  for (const ep of entityPlacements) {
    const entity = model.entities.find(e => e.id === ep.id)
    if (!entity) continue
    nodes.push({
      id: `entity:${ep.id}`,
      name: ep.name,
      type: 'entity',
      description: entity.description.slice(0, 120),
      val: 12,
      fx: ep.milestoneIdx * SPINE_SPACING + ep.z,
      fy: ep.y,
      fz: 15,
    })
    links.push({ source: `milestone:${states[ep.milestoneIdx]}`, target: `entity:${ep.id}`, type: 'activates' })
  }

  // Actors — spread around the spine
  let actorIdx = 0
  for (const actor of model.actors) {
    const allText = actor.responsibilities.map(r => r.description).join(' ')
    const xPos = getZPosition(allText, 1.5 * SPINE_SPACING)
    const angle = ((actorIdx / model.actors.length) * Math.PI) - Math.PI / 2
    const r = 50

    nodes.push({
      id: `actor:${actor.id}`,
      name: actor.name,
      type: 'actor',
      description: actor.description.slice(0, 120),
      val: 12,
      fx: xPos,
      fy: Math.sin(angle) * r + 50,
      fz: Math.cos(angle) * 20,
    })

    const nearestIdx = Math.max(0, Math.min(states.length - 1, Math.round(xPos / SPINE_SPACING)))
    links.push({ source: `actor:${actor.id}`, target: `milestone:${states[nearestIdx]}`, type: 'activates' })
    actorIdx++
  }

  // Journeys
  let journeyIdx = 0
  for (const journey of model.journeys) {
    const allText = journey.steps.map(s => s.detail).join(' ') + ' ' + journey.name
    const xPos = getZPosition(allText, 2 * SPINE_SPACING)
    const angle = ((journeyIdx / model.journeys.length) * Math.PI) + Math.PI / 2
    const r = 55

    nodes.push({
      id: `journey:${journey.id}`,
      name: journey.name,
      type: 'journey',
      description: `${journey.steps.length} steps — ${journey.success_outcome.slice(0, 80)}`,
      val: 10,
      fx: xPos,
      fy: Math.sin(angle) * r - 50,
      fz: Math.cos(angle) * 20,
    })

    links.push({ source: `journey:${journey.id}`, target: `actor:${journey.primary_actor}`, type: 'activates' })
    journeyIdx++
  }

  // Rules — small, spread below
  let ruleIdx = 0
  for (const rule of model.business_rules) {
    const xPos = getZPosition(rule.description, 2 * SPINE_SPACING)
    const spread = ((ruleIdx / model.business_rules.length) - 0.5) * 60

    nodes.push({
      id: `rule:${rule.id}`,
      name: rule.id,
      type: 'rule',
      description: rule.description.slice(0, 120),
      val: 8,
      fx: xPos + spread * 0.5,
      fy: -70 + Math.abs(spread) * 0.3,
      fz: spread,
    })

    for (const ref of rule.applies_to) {
      if (nodes.some(n => n.id === `entity:${ref}`)) {
        links.push({ source: `rule:${rule.id}`, target: `entity:${ref}`, type: 'governs' })
      } else if (nodes.some(n => n.id === `actor:${ref}`)) {
        links.push({ source: `rule:${rule.id}`, target: `actor:${ref}`, type: 'governs' })
      }
    }
    ruleIdx++
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

      const hbl = model.entities.find(e => e.id === 'hbl')
      const states = hbl?.lifecycle.states ?? []

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const graph: any = ForceGraph3D()(containerRef.current)

      // Build tube geometry along the spine BEFORE setting graph data
      const spinePoints = states.map((_, i) => new THREE.Vector3(i * SPINE_SPACING, 0, 0))
      if (spinePoints.length >= 2) {
        const curve = new THREE.CatmullRomCurve3(spinePoints)
        const tubeGeo = new THREE.TubeGeometry(curve, 64, 4, 8, false)
        const tubeMat = new THREE.MeshLambertMaterial({
          color: '#002C61',
          transparent: true,
          opacity: 0.15,
        })
        const tube = new THREE.Mesh(tubeGeo, tubeMat)
        graph.scene().add(tube)

        // Arrow particle that runs through the tube
        const arrowGeo = new THREE.ConeGeometry(2.5, 6, 6)
        arrowGeo.rotateZ(-Math.PI / 2) // point along X
        const arrowMat = new THREE.MeshLambertMaterial({ color: '#0081F2' })
        const arrow = new THREE.Mesh(arrowGeo, arrowMat)
        graph.scene().add(arrow)

        // Animate arrow along the tube
        let arrowT = 0
        const animateArrow = () => {
          if (destroyed) return
          arrowT += 0.002
          if (arrowT > 1) arrowT = 0
          const pos = curve.getPointAt(arrowT)
          const tangent = curve.getTangentAt(arrowT)
          arrow.position.copy(pos)
          arrow.lookAt(pos.clone().add(tangent))
          arrow.rotateZ(-Math.PI / 2)
          requestAnimationFrame(animateArrow)
        }
        animateArrow()
      }

      graph.graphData({ nodes, links })
        .backgroundColor('#F8F8F7')
        .nodeLabel((node: LifecycleNode) => `
          <div style="background:rgba(0,0,0,0.9);color:white;padding:10px 14px;border-radius:10px;font-family:DM Sans Variable,sans-serif;max-width:280px;font-size:12px;line-height:1.5;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.3)">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;opacity:0.6;margin-bottom:2px">${LIFECYCLE_LABELS[node.type]}</div>
            <div style="font-weight:600;margin-bottom:4px">${node.name}</div>
            <div style="opacity:0.8">${node.description}</div>
          </div>
        `)
        .nodeThreeObject((node: LifecycleNode) => {
          const color = LIFECYCLE_COLORS[node.type]
          const group = new THREE.Group()

          if (node.type === 'milestone') {
            // Milestone: emoji icon on a flat plane + label below
            const stateKey = node.id.replace('milestone:', '')
            const icon = MILESTONE_ICONS[stateKey]

            // Emoji disc
            const discCanvas = document.createElement('canvas')
            const discCtx = discCanvas.getContext('2d')!
            discCanvas.width = 256
            discCanvas.height = 256
            // Background circle
            discCtx.beginPath()
            discCtx.arc(128, 128, 120, 0, Math.PI * 2)
            discCtx.fillStyle = '#002C61'
            discCtx.fill()
            // Emoji
            discCtx.font = '100px serif'
            discCtx.textAlign = 'center'
            discCtx.textBaseline = 'middle'
            discCtx.fillText(icon?.emoji ?? '⬤', 128, 128)

            const discTex = new THREE.CanvasTexture(discCanvas)
            const discMat = new THREE.SpriteMaterial({ map: discTex, transparent: true })
            const disc = new THREE.Sprite(discMat)
            disc.scale.set(18, 18, 1)
            group.add(disc)

            // Label below
            const labelCanvas = document.createElement('canvas')
            const labelCtx = labelCanvas.getContext('2d')!
            labelCanvas.width = 512
            labelCanvas.height = 96
            labelCtx.font = 'bold 40px system-ui, -apple-system, sans-serif'
            labelCtx.fillStyle = '#002C61'
            labelCtx.textAlign = 'center'
            labelCtx.textBaseline = 'middle'
            labelCtx.fillText(icon?.label ?? stateKey, 256, 48)

            const labelTex = new THREE.CanvasTexture(labelCanvas)
            const labelMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthWrite: false })
            const label = new THREE.Sprite(labelMat)
            label.scale.set(28, 28 * (96 / 512), 1)
            label.position.set(0, -14, 0)
            group.add(label)
          } else {
            // Other nodes: sphere + label
            const radius = Math.max(4, 3 + Math.min(node.val, 15) * 0.2)
            const geo = new THREE.SphereGeometry(radius, 16, 12)
            const mat = new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.85 })
            group.add(new THREE.Mesh(geo, mat))

            // Label
            const scale = 2
            const canvasW = 512 * scale
            const canvasH = 64 * scale
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')!
            canvas.width = canvasW
            canvas.height = canvasH
            ctx.font = `600 ${22 * scale}px system-ui, -apple-system, sans-serif`
            ctx.fillStyle = '#34322D'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            const displayName = node.name.length > 22 ? node.name.slice(0, 20) + '…' : node.name
            ctx.fillText(displayName, canvasW / 2, canvasH / 2)

            const texture = new THREE.CanvasTexture(canvas)
            const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
            const sprite = new THREE.Sprite(spriteMat)
            const spriteW = 24
            sprite.scale.set(spriteW, spriteW * (canvasH / canvasW), 1)
            sprite.position.set(0, radius + 3, 0)
            group.add(sprite)
          }

          return group
        })
        .nodeThreeObjectExtend(false)
        .linkColor((link: LifecycleLink) => {
          if (link.type === 'spine') return 'rgba(0,0,0,0)' // hidden — tube replaces it
          if (link.type === 'governs') return '#F59E0B44'
          return '#85848133'
        })
        .linkWidth((link: LifecycleLink) => link.type === 'spine' ? 0 : 1)
        .linkOpacity(0.4)
        .linkDirectionalParticles(0)
        .linkDirectionalParticleWidth(3)
        .linkDirectionalParticleSpeed(0.008)
        .linkDirectionalParticleColor(() => '#0081F2')
        .onNodeClick((node: LifecycleNode) => {
          handleNodeClick(node)
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

      // Fixed positions — no simulation
      graph.warmupTicks(50)
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

      // Camera: slightly above, looking along the spine
      const midX = (states.length - 1) * SPINE_SPACING / 2
      graph.cameraPosition(
        { x: midX, y: 80, z: 200 },
        { x: midX, y: 0, z: 0 },
      )

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
        style={{ background: 'var(--bg-white)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-float)' }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          HBL Lifecycle
        </span>
        {Object.entries(LIFECYCLE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{LIFECYCLE_LABELS[type]}</span>
          </div>
        ))}
      </div>

      {/* Selected node */}
      {selectedNode && (
        <div
          className="absolute top-4 right-4 rounded-xl p-4"
          style={{ width: 340, background: 'var(--bg-white)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-overlay)' }}
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
