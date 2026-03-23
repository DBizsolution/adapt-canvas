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
  rule: '#9CA3AF',
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

// --- Lucide icon SVG content (from lucide-react v0.577.0) ---

const ICON_SVG: Record<string, string> = {
  ship: [
    '<path d="M12 10.189V14"/>',
    '<path d="M12 2v3"/>',
    '<path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>',
    '<path d="M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76"/>',
    '<path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  ].join(''),
  anchor: [
    '<path d="M12 6v16"/>',
    '<path d="m19 13 2-1a9 9 0 0 1-18 0l2 1"/>',
    '<path d="M9 11h6"/>',
    '<circle cx="12" cy="4" r="2"/>',
  ].join(''),
  warehouse: [
    '<path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11"/>',
    '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z"/>',
    '<path d="M6 13h12"/>',
    '<path d="M6 17h12"/>',
  ].join(''),
  packageOpen: [
    '<path d="M12 22v-9"/>',
    '<path d="M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z"/>',
    '<path d="M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13"/>',
    '<path d="M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z"/>',
  ].join(''),
  truck: [
    '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>',
    '<path d="M15 18H9"/>',
    '<path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>',
    '<circle cx="17" cy="18" r="2"/>',
    '<circle cx="7" cy="18" r="2"/>',
  ].join(''),
  database: [
    '<ellipse cx="12" cy="5" rx="9" ry="3"/>',
    '<path d="M3 5V19A9 3 0 0 0 21 19V5"/>',
    '<path d="M3 12A9 3 0 0 0 21 12"/>',
  ].join(''),
  user: [
    '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>',
    '<circle cx="12" cy="7" r="4"/>',
  ].join(''),
  route: [
    '<circle cx="6" cy="19" r="3"/>',
    '<path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>',
    '<circle cx="18" cy="5" r="3"/>',
  ].join(''),
  scale: [
    '<path d="M12 3v18"/>',
    '<path d="m19 8 3 8a5 5 0 0 1-6 0zV7"/>',
    '<path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/>',
    '<path d="m5 8 3 8a5 5 0 0 1-6 0zV7"/>',
    '<path d="M7 21h10"/>',
  ].join(''),
  shieldAlert: [
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    '<path d="M12 8v4"/>',
    '<path d="M12 16h.01"/>',
  ].join(''),
}

const MILESTONE_ICONS: Record<string, string> = {
  on_vessel: 'ship',
  at_wharf: 'anchor',
  in_yard: 'warehouse',
  unpacked: 'packageOpen',
  collected: 'truck',
}

const TYPE_ICONS: Record<string, string> = {
  entity: 'database',
  actor: 'user',
  journey: 'route',
  rule: 'scale',
  constraint: 'shieldAlert',
}

const ICON_SIZES: Record<string, number> = {
  entity: 8,
  actor: 8,
  journey: 8,
  rule: 6,
  constraint: 7,
}

// --- Icon texture helpers ---

function buildIconSvg(iconContent: string, bgColor: string): string {
  const s = 256
  const pad = s * 0.22
  const iconSize = s - pad * 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <circle cx="${s / 2}" cy="${s / 2}" r="${s / 2 - 2}" fill="${bgColor}"/>
    <svg x="${pad}" y="${pad}" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      ${iconContent}
    </svg>
  </svg>`
}

function loadSvgTexture(
  THREE: typeof import('three'),
  svgMarkup: string,
): Promise<import('three').CanvasTexture> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256
      canvas.getContext('2d')!.drawImage(img, 0, 0, 256, 256)
      resolve(new THREE.CanvasTexture(canvas))
    }
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`
  })
}

async function loadAllIconTextures(THREE: typeof import('three')): Promise<Map<string, import('three').CanvasTexture>> {
  const cache = new Map<string, import('three').CanvasTexture>()

  const configs: [string, string, string][] = [
    ['ship', ICON_SVG.ship, LIFECYCLE_COLORS.milestone],
    ['anchor', ICON_SVG.anchor, LIFECYCLE_COLORS.milestone],
    ['warehouse', ICON_SVG.warehouse, LIFECYCLE_COLORS.milestone],
    ['packageOpen', ICON_SVG.packageOpen, LIFECYCLE_COLORS.milestone],
    ['truck', ICON_SVG.truck, LIFECYCLE_COLORS.milestone],
    ['database', ICON_SVG.database, LIFECYCLE_COLORS.entity],
    ['user', ICON_SVG.user, LIFECYCLE_COLORS.actor],
    ['route', ICON_SVG.route, LIFECYCLE_COLORS.journey],
    ['scale', ICON_SVG.scale, LIFECYCLE_COLORS.rule],
    ['shieldAlert', ICON_SVG.shieldAlert, LIFECYCLE_COLORS.constraint],
  ]

  await Promise.all(configs.map(([key, svg, color]) =>
    loadSvgTexture(THREE, buildIconSvg(svg, color)).then(tex => cache.set(key, tex)),
  ))

  return cache
}

function makeTextSprite(
  THREE: typeof import('three'),
  text: string,
  fontSize: number = 44,
  color: string = '#34322D',
): import('three').Sprite {
  const canvasW = 1024
  const canvasH = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!
  ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const label = text.length > 20 ? text.slice(0, 18) + '\u2026' : text
  ctx.fillText(label, canvasW / 2, canvasH / 2)

  const texture = new THREE.CanvasTexture(canvas)
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
  const sprite = new THREE.Sprite(mat)
  const spriteW = 22
  sprite.scale.set(spriteW, spriteW * (canvasH / canvasW), 1)
  return sprite
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
    const jMilestoneIdx = Math.max(0, Math.min(states.length - 1, Math.round(xIdx)))
    links.push({ source: `journey:${journey.id}`, target: `milestone:${states[jMilestoneIdx]}`, type: 'activates' })
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
    const rMilestoneIdx = Math.max(0, Math.min(states.length - 1, Math.round(xIdx)))
    links.push({ source: `rule:${rule.id}`, target: `milestone:${states[rMilestoneIdx]}`, type: 'activates' })
    ruleIdx++
  }

  return { nodes, links }
}

// --- Component ---

const TOGGLEABLE_TYPES = ['entity', 'actor', 'journey', 'rule', 'constraint'] as const

export function Graph3DLifecycle({ model }: { model: IntentModel }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedNode, setSelectedNode] = useState<LifecycleNode | null>(null)
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set())
  const graphRef = useRef<any>(null)
  const fullData = useRef(buildLifecycleData(model))

  const toggleType = useCallback((type: string) => {
    setHiddenTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const handleNodeClick = useCallback((node: LifecycleNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node)
  }, [])

  // Filter graph data + connection lines when toggles change
  useEffect(() => {
    if (!graphRef.current) return
    const graph = graphRef.current as any
    const { nodes } = fullData.current

    const visibleNodes = nodes.filter(n => n.type === 'milestone' || !hiddenTypes.has(n.type))
    graph.graphData({ nodes: visibleNodes, links: [] })

    const lines = graph.__connectionLines as Array<{ mesh: any; sourceType: string; targetType: string }> | undefined
    if (lines) {
      for (const line of lines) {
        const srcHidden = hiddenTypes.has(line.sourceType)
        const tgtHidden = hiddenTypes.has(line.targetType)
        line.mesh.visible = !srcHidden && !tgtHidden
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
      const { nodes, links } = buildLifecycleData(model)

      const hbl = model.entities.find(e => e.id === 'hbl')
      const states = hbl?.lifecycle.states ?? []

      // Load all icon textures
      const textures = await loadAllIconTextures(THREE)
      if (destroyed) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const graph: any = ForceGraph3D()(containerRef.current)

      // --- Spine tube (pipeline) ---
      const spinePoints = states.map((_, i) => new THREE.Vector3(i * SPINE_SPACING, 0, 0))
      if (spinePoints.length >= 2) {
        spinePoints.unshift(new THREE.Vector3(-15, 0, 0))
        spinePoints.push(new THREE.Vector3((states.length - 1) * SPINE_SPACING + 8, 0, 0))

        const curve = new THREE.CatmullRomCurve3(spinePoints)
        const tubeGeo = new THREE.TubeGeometry(curve, 64, 1.5, 8, false)
        const tubeMat = new THREE.MeshLambertMaterial({ color: '#002C61', transparent: true, opacity: 0.25 })
        graph.scene().add(new THREE.Mesh(tubeGeo, tubeMat))

        const innerGeo = new THREE.TubeGeometry(curve, 64, 0.6, 8, false)
        const innerMat = new THREE.MeshBasicMaterial({ color: '#0081F2', transparent: true, opacity: 0.4 })
        graph.scene().add(new THREE.Mesh(innerGeo, innerMat))

        const arrowGeo = new THREE.ConeGeometry(1.8, 5, 6)
        arrowGeo.rotateZ(-Math.PI / 2)
        const arrowMat = new THREE.MeshLambertMaterial({ color: '#0081F2' })
        const arrow = new THREE.Mesh(arrowGeo, arrowMat)
        graph.scene().add(arrow)

        let arrowT = 0
        const animateArrow = () => {
          if (destroyed) return
          arrowT += 0.0015
          if (arrowT > 0.92) arrowT = 0
          const pos = curve.getPointAt(arrowT)
          const tangent = curve.getTangentAt(arrowT)
          arrow.position.copy(pos)
          arrow.lookAt(pos.clone().add(tangent))
          arrow.rotateZ(-Math.PI / 2)
          requestAnimationFrame(animateArrow)
        }
        animateArrow()
      }

      // --- Milestone icon sprites ---
      for (let i = 0; i < states.length; i++) {
        const iconKey = MILESTONE_ICONS[states[i]]
        const texture = textures.get(iconKey)
        if (!texture) continue

        const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
        const sprite = new THREE.Sprite(mat)
        sprite.scale.set(14, 14, 1)
        sprite.position.set(i * SPINE_SPACING, 0, 0)
        graph.scene().add(sprite)

        // Label below milestone
        const label = makeTextSprite(THREE, MILESTONE_LABELS[states[i]] ?? states[i], 48, '#002C61')
        label.position.set(i * SPINE_SPACING, -10, 0)
        graph.scene().add(label)
      }

      // --- Connection lines ---
      const lineMat = new THREE.MeshBasicMaterial({ color: '#AAAAAA' })
      const nodePositions = new Map<string, { x: number; y: number; z: number }>()
      const nodeTypeMap = new Map<string, string>()
      for (const n of nodes) {
        if (n.fx !== undefined && n.fy !== undefined && n.fz !== undefined) {
          nodePositions.set(n.id, { x: n.fx, y: n.fy, z: n.fz })
        }
        nodeTypeMap.set(n.id, n.type)
      }

      type ConnectionLine = { mesh: import('three').Mesh; sourceType: string; targetType: string }
      const connectionLines: ConnectionLine[] = []

      for (const link of links) {
        if (link.type === 'spine') continue
        const srcPos = nodePositions.get(link.source)
        const tgtPos = nodePositions.get(link.target)
        if (!srcPos || !tgtPos) continue

        const start = new THREE.Vector3(srcPos.x, srcPos.y, srcPos.z)
        const end = new THREE.Vector3(tgtPos.x, tgtPos.y, tgtPos.z)
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
        const length = start.distanceTo(end)

        const cylGeo = new THREE.CylinderGeometry(0.15, 0.15, length, 4, 1)
        const cyl = new THREE.Mesh(cylGeo, lineMat)
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
        .nodeLabel((node: LifecycleNode) => `
          <div style="background:rgba(0,0,0,0.9);color:white;padding:10px 14px;border-radius:10px;font-family:DM Sans Variable,sans-serif;max-width:280px;font-size:12px;line-height:1.5;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.3)">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;opacity:0.6;margin-bottom:2px">${LIFECYCLE_LABELS[node.type]}</div>
            <div style="font-weight:600;margin-bottom:4px">${node.name}</div>
            <div style="opacity:0.8">${node.description}</div>
          </div>
        `)
        .nodeThreeObject((node: LifecycleNode) => {
          const group = new THREE.Group()

          if (node.type === 'milestone') return group

          const iconKey = TYPE_ICONS[node.type]
          const texture = textures.get(iconKey)
          const size = ICON_SIZES[node.type] ?? 8

          if (texture) {
            const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
            const sprite = new THREE.Sprite(mat)
            sprite.scale.set(size, size, 1)
            group.add(sprite)
          }

          // Label below icon
          const label = makeTextSprite(THREE, node.name)
          label.position.set(0, -(size / 2 + 2), 0)
          group.add(label)

          return group
        })
        .nodeThreeObjectExtend(false)
        .linkColor(() => '#888888')
        .linkWidth(0)
        .linkOpacity(0)
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

      graphRef.current = graph

      // Tooltip fix
      const style = document.createElement('style')
      style.textContent = '.graph-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }'
      containerRef.current.appendChild(style)

      const rect = containerRef.current.getBoundingClientRect()
      graph.width(rect.width).height(rect.height)

      // Isometric camera
      const midX = (states.length - 1) * SPINE_SPACING / 2
      const dist = 280
      const azimuth = Math.PI / 4
      const elevation = Math.atan(1 / Math.sqrt(2))
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
        {Object.entries(LIFECYCLE_COLORS).map(([type, color]) => {
          const canToggle = TOGGLEABLE_TYPES.includes(type as any)
          const isHidden = hiddenTypes.has(type)
          return canToggle ? (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-all duration-200"
              style={{ opacity: isHidden ? 0.3 : 1, background: isHidden ? 'transparent' : `${color}12` }}
              title={`${isHidden ? 'Show' : 'Hide'} ${LIFECYCLE_LABELS[type]}s`}
            >
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              <span className="text-[11px] font-medium" style={{ color: isHidden ? 'var(--text-muted)' : color }}>{LIFECYCLE_LABELS[type]}</span>
            </button>
          ) : (
            <div key={type} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{LIFECYCLE_LABELS[type]}</span>
            </div>
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
              style={{ background: `${LIFECYCLE_COLORS[selectedNode.type]}18`, color: LIFECYCLE_COLORS[selectedNode.type] }}
            >
              {LIFECYCLE_LABELS[selectedNode.type]}
            </span>
            <button type="button" onClick={() => setSelectedNode(null)} className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>&#x2715;</button>
          </div>
          <h3 className="text-sm font-semibold m-0 mb-1" style={{ color: 'var(--text-primary)' }}>{selectedNode.name}</h3>
          <p className="text-xs leading-relaxed m-0" style={{ color: 'var(--text-secondary)' }}>{selectedNode.description}</p>
        </div>
      )}
    </div>
  )
}
