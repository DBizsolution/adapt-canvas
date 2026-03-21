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

const MILESTONE_LABELS: Record<string, string> = {
  on_vessel: 'On Vessel',
  at_wharf: 'At Wharf',
  in_yard: 'In Yard',
  unpacked: 'Unpacked',
  collected: 'Collected',
}

const SPINE_SPACING = 40

// --- Low-poly 3D milestone builders ---

function buildShip(THREE: typeof import('three')): import('three').Group {
  const g = new THREE.Group()
  // Hull
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(10, 3, 5),
    new THREE.MeshLambertMaterial({ color: '#1a3a5c' }),
  )
  g.add(hull)
  // Cabin
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 3),
    new THREE.MeshLambertMaterial({ color: '#2a5a8c' }),
  )
  cabin.position.set(-2, 3, 0)
  g.add(cabin)
  // Bow wedge
  const bowGeo = new THREE.BufferGeometry()
  const verts = new Float32Array([
    5, 1.5, 2.5,   5, 1.5, -2.5,   8, 0, 0,
    5, -1.5, 2.5,  5, -1.5, -2.5,  8, 0, 0,
    5, 1.5, 2.5,   5, -1.5, 2.5,   8, 0, 0,
    5, 1.5, -2.5,  5, -1.5, -2.5,  8, 0, 0,
  ])
  bowGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
  bowGeo.computeVertexNormals()
  g.add(new THREE.Mesh(bowGeo, new THREE.MeshLambertMaterial({ color: '#1a3a5c' })))
  return g
}

function buildWharf(THREE: typeof import('three')): import('three').Group {
  const g = new THREE.Group()
  // Platform
  g.add(new THREE.Mesh(
    new THREE.BoxGeometry(12, 1, 8),
    new THREE.MeshLambertMaterial({ color: '#8B7355' }),
  ))
  // Pillars
  for (const x of [-4, 0, 4]) {
    for (const z of [-3, 3]) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 5, 6),
        new THREE.MeshLambertMaterial({ color: '#6B5340' }),
      )
      pillar.position.set(x, -3, z)
      g.add(pillar)
    }
  }
  // Bollard
  const bollard = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.8, 1.5, 8),
    new THREE.MeshLambertMaterial({ color: '#333' }),
  )
  bollard.position.set(5, 1.2, 0)
  g.add(bollard)
  return g
}

function buildContainer(THREE: typeof import('three')): import('three').Group {
  const g = new THREE.Group()
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(8, 5, 4),
    new THREE.MeshLambertMaterial({ color: '#0066AA' }),
  )
  g.add(box)
  // Door lines
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(8, 5, 4)),
    new THREE.LineBasicMaterial({ color: '#004488' }),
  )
  g.add(edges)
  // Corrugation ridges
  for (let i = -3; i <= 3; i += 1.5) {
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 4.8, 4.1),
      new THREE.MeshLambertMaterial({ color: '#004488' }),
    )
    ridge.position.set(i, 0, 0)
    g.add(ridge)
  }
  return g
}

function buildOpenBox(THREE: typeof import('three')): import('three').Group {
  const g = new THREE.Group()
  // Base
  g.add(new THREE.Mesh(
    new THREE.BoxGeometry(7, 0.3, 5),
    new THREE.MeshLambertMaterial({ color: '#C4956A' }),
  ))
  // Walls
  const wallMat = new THREE.MeshLambertMaterial({ color: '#D4A574' })
  // Back
  const back = new THREE.Mesh(new THREE.BoxGeometry(7, 4, 0.3), wallMat)
  back.position.set(0, 2, -2.5)
  g.add(back)
  // Left
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4, 5), wallMat)
  left.position.set(-3.5, 2, 0)
  g.add(left)
  // Right
  const right = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4, 5), wallMat)
  right.position.set(3.5, 2, 0)
  g.add(right)
  // Front wall (shorter — open top)
  const front = new THREE.Mesh(new THREE.BoxGeometry(7, 2, 0.3), wallMat)
  front.position.set(0, 1, 2.5)
  g.add(front)
  // Flap (open lid)
  const flap = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.2, 3), wallMat)
  flap.position.set(0, 4.2, -4)
  flap.rotation.x = -0.6
  g.add(flap)
  return g
}

function buildTruck(THREE: typeof import('three')): import('three').Group {
  const g = new THREE.Group()
  // Trailer
  g.add(new THREE.Mesh(
    new THREE.BoxGeometry(9, 4, 4),
    new THREE.MeshLambertMaterial({ color: '#25BA3B' }),
  ))
  // Cab
  const cab = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 3.5, 3.8),
    new THREE.MeshLambertMaterial({ color: '#1a8a2a' }),
  )
  cab.position.set(6, -0.25, 0)
  g.add(cab)
  // Windshield
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 2, 3),
    new THREE.MeshLambertMaterial({ color: '#88CCFF', transparent: true, opacity: 0.7 }),
  )
  windshield.position.set(7.8, 0.3, 0)
  g.add(windshield)
  // Wheels
  const wheelMat = new THREE.MeshLambertMaterial({ color: '#222' })
  for (const x of [-3, 1, 5.5]) {
    for (const z of [-2.2, 2.2]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 8), wheelMat)
      wheel.rotation.x = Math.PI / 2
      wheel.position.set(x, -2.5, z)
      g.add(wheel)
    }
  }
  return g
}

const MILESTONE_BUILDERS: Record<string, (THREE: typeof import('three')) => import('three').Group> = {
  on_vessel: buildShip,
  at_wharf: buildWharf,
  in_yard: buildContainer,
  unpacked: buildOpenBox,
  collected: buildTruck,
}

// --- Data builder ---

function buildLifecycleData(model: IntentModel): { nodes: LifecycleNode[]; links: LifecycleLink[] } {
  const nodes: LifecycleNode[] = []
  const links: LifecycleLink[] = []

  const hbl = model.entities.find(e => e.id === 'hbl')
  if (!hbl) return { nodes, links }

  const states = hbl.lifecycle.states

  for (let i = 0; i < states.length; i++) {
    nodes.push({
      id: `milestone:${states[i]}`,
      name: MILESTONE_LABELS[states[i]] ?? states[i],
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

  const classify = (text: string): number => {
    const l = text.toLowerCase()
    if (l.includes('unpacked') || l.includes('book pickup') || l.includes('book a pickup') || l.includes('booking readiness')) return 3
    if (l.includes('collected') || l.includes('pickup verification') || l.includes('gatehouse') || l.includes('verifies pickup')) return 4
    if (l.includes('delegat')) return 0.5
    if (l.includes('slot config') || l.includes('configures pickup')) return 2.5
    if (l.includes('delivery order') || l.includes('validates do')) return 2.5
    if (l.includes('cancel')) return 3.5
    if (l.includes('creates a user') || l.includes('user management') || l.includes('removes a user')) return -0.3
    if (l.includes('fee') || l.includes('payment')) return 3.2
    if (l.includes('cutoff')) return 3
    return 1.5
  }

  // Entities
  const entityPlacements = [
    { id: 'booking', milestoneIdx: 3 },
    { id: 'slot', milestoneIdx: 3 },
    { id: 'delivery_order', milestoneIdx: 2 },
    { id: 'delegation', milestoneIdx: 0 },
    { id: 'driver_record', milestoneIdx: 3 },
  ]
  let entityAngle = 0
  for (const ep of entityPlacements) {
    const entity = model.entities.find(e => e.id === ep.id)
    if (!entity) continue
    const angle = entityAngle * 1.3 + 0.5
    const r = 20
    nodes.push({
      id: `entity:${ep.id}`,
      name: entity.name,
      type: 'entity',
      description: entity.description.slice(0, 120),
      val: 12,
      fx: ep.milestoneIdx * SPINE_SPACING + Math.cos(angle) * 5,
      fy: Math.sin(angle) * r,
      fz: Math.cos(angle) * r,
    })
    links.push({ source: `milestone:${states[ep.milestoneIdx]}`, target: `entity:${ep.id}`, type: 'activates' })
    entityAngle++
  }

  // Actors
  let actorIdx = 0
  for (const actor of model.actors) {
    const allText = actor.responsibilities.map(r => r.description).join(' ')
    const xIdx = classify(allText)
    const angle = (actorIdx / model.actors.length) * Math.PI * 2
    const r = 25
    nodes.push({
      id: `actor:${actor.id}`,
      name: actor.name,
      type: 'actor',
      description: actor.description.slice(0, 120),
      val: 12,
      fx: xIdx * SPINE_SPACING,
      fy: Math.sin(angle) * r,
      fz: Math.cos(angle) * r,
    })
    const nearestIdx = Math.max(0, Math.min(states.length - 1, Math.round(xIdx)))
    links.push({ source: `actor:${actor.id}`, target: `milestone:${states[nearestIdx]}`, type: 'activates' })
    actorIdx++
  }

  // Journeys
  let journeyIdx = 0
  for (const journey of model.journeys) {
    const allText = journey.steps.map(s => s.detail).join(' ') + ' ' + journey.name
    const xIdx = classify(allText)
    const angle = (journeyIdx / model.journeys.length) * Math.PI * 2 + 0.7
    const r = 30
    nodes.push({
      id: `journey:${journey.id}`,
      name: journey.name,
      type: 'journey',
      description: `${journey.steps.length} steps — ${journey.success_outcome.slice(0, 80)}`,
      val: 10,
      fx: xIdx * SPINE_SPACING,
      fy: Math.sin(angle) * r,
      fz: Math.cos(angle) * r,
    })
    links.push({ source: `journey:${journey.id}`, target: `actor:${journey.primary_actor}`, type: 'activates' })
    journeyIdx++
  }

  // Rules
  let ruleIdx = 0
  for (const rule of model.business_rules) {
    const xIdx = classify(rule.description)
    const angle = (ruleIdx / model.business_rules.length) * Math.PI * 2 + 1.2
    const r = 35
    nodes.push({
      id: `rule:${rule.id}`,
      name: rule.id,
      type: 'rule',
      description: rule.description.slice(0, 120),
      val: 8,
      fx: xIdx * SPINE_SPACING,
      fy: Math.sin(angle) * r,
      fz: Math.cos(angle) * r,
    })
    for (const ref of rule.applies_to) {
      if (nodes.some(n => n.id === `entity:${ref}`))
        links.push({ source: `rule:${rule.id}`, target: `entity:${ref}`, type: 'governs' })
      else if (nodes.some(n => n.id === `actor:${ref}`))
        links.push({ source: `rule:${rule.id}`, target: `actor:${ref}`, type: 'governs' })
    }
    ruleIdx++
  }

  return { nodes, links }
}

// --- Component ---

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

      // --- Tube (thin pipeline) ---
      const spinePoints = states.map((_, i) => new THREE.Vector3(i * SPINE_SPACING, 0, 0))
      // Extend slightly beyond first/last milestone
      if (spinePoints.length >= 2) {
        spinePoints.unshift(new THREE.Vector3(-15, 0, 0))
        spinePoints.push(new THREE.Vector3((states.length - 1) * SPINE_SPACING + 15, 0, 0))

        const curve = new THREE.CatmullRomCurve3(spinePoints)
        const tubeGeo = new THREE.TubeGeometry(curve, 64, 1.5, 8, false)
        const tubeMat = new THREE.MeshLambertMaterial({ color: '#002C61', transparent: true, opacity: 0.25 })
        graph.scene().add(new THREE.Mesh(tubeGeo, tubeMat))

        // Glowing inner tube
        const innerGeo = new THREE.TubeGeometry(curve, 64, 0.6, 8, false)
        const innerMat = new THREE.MeshBasicMaterial({ color: '#0081F2', transparent: true, opacity: 0.4 })
        graph.scene().add(new THREE.Mesh(innerGeo, innerMat))

        // Animated arrow
        const arrowGeo = new THREE.ConeGeometry(1.8, 5, 6)
        arrowGeo.rotateZ(-Math.PI / 2)
        const arrowMat = new THREE.MeshLambertMaterial({ color: '#0081F2' })
        const arrow = new THREE.Mesh(arrowGeo, arrowMat)
        graph.scene().add(arrow)

        let arrowT = 0
        const animateArrow = () => {
          if (destroyed) return
          arrowT += 0.0015
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

      // --- Low-poly milestone models (added directly to scene, not as graph nodes) ---
      for (let i = 0; i < states.length; i++) {
        const builder = MILESTONE_BUILDERS[states[i]]
        if (!builder) continue
        const milestoneModel = builder(THREE)
        milestoneModel.position.set(i * SPINE_SPACING, 0, 0)
        milestoneModel.scale.setScalar(1.2)
        graph.scene().add(milestoneModel)

        // Label below the model
        const labelCanvas = document.createElement('canvas')
        const labelCtx = labelCanvas.getContext('2d')!
        labelCanvas.width = 1024
        labelCanvas.height = 128
        labelCtx.font = 'bold 64px system-ui, -apple-system, sans-serif'
        labelCtx.fillStyle = '#002C61'
        labelCtx.textAlign = 'center'
        labelCtx.textBaseline = 'middle'
        labelCtx.fillText(MILESTONE_LABELS[states[i]] ?? states[i], 512, 64)

        const labelTex = new THREE.CanvasTexture(labelCanvas)
        const labelMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthWrite: false })
        const label = new THREE.Sprite(labelMat)
        label.scale.set(30, 30 * (128 / 1024), 1)
        label.position.set(i * SPINE_SPACING, -12, 0)
        graph.scene().add(label)
      }

      // --- Graph setup ---
      graph.graphData({ nodes: nodes.filter(n => n.type !== 'milestone'), links: links.filter(l => l.type !== 'spine') })
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

          const radius = Math.max(3, 2 + Math.min(node.val, 15) * 0.2)
          const geo = new THREE.SphereGeometry(radius, 16, 12)
          const mat = new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.85 })
          group.add(new THREE.Mesh(geo, mat))

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
          const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
          const sprite = new THREE.Sprite(spriteMat)
          const spriteW = 22
          sprite.scale.set(spriteW, spriteW * (canvasH / canvasW), 1)
          sprite.position.set(0, radius + 2.5, 0)
          group.add(sprite)

          return group
        })
        .nodeThreeObjectExtend(false)
        .linkColor((link: LifecycleLink) => {
          if (link.type === 'governs') return '#F59E0B55'
          return '#85848144'
        })
        .linkWidth(1)
        .linkOpacity(0.4)
        .linkDirectionalParticles(0)
        .linkDirectionalParticleWidth(2.5)
        .linkDirectionalParticleSpeed(0.008)
        .linkDirectionalParticleColor(() => '#0081F2')
        .onNodeClick((node: LifecycleNode) => {
          handleNodeClick(node)
          const gd = graph.graphData()
          const getId = (n: unknown) => typeof n === 'string' ? n : (n as LifecycleNode)?.id ?? ''
          const direct = gd.links.filter((l: any) => getId(l.source) === node.id || getId(l.target) === node.id)
          for (let i = 0; i < direct.length; i++) {
            setTimeout(() => graph.emitParticle(direct[i]), i * 80)
          }
        })

      // No simulation — fixed positions
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

      // Isometric camera
      const midX = (states.length - 1) * SPINE_SPACING / 2
      const dist = 280
      // Isometric angles: 45° azimuth, ~35° elevation
      const azimuth = Math.PI / 4
      const elevation = Math.atan(1 / Math.sqrt(2)) // ~35.264°
      graph.cameraPosition(
        {
          x: midX + dist * Math.cos(elevation) * Math.sin(azimuth),
          y: dist * Math.sin(elevation),
          z: dist * Math.cos(elevation) * Math.cos(azimuth),
        },
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
