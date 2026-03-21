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
  const mat = new THREE.MeshPhongMaterial({ color: '#1a3a5c', shininess: 40 })
  const matLight = new THREE.MeshPhongMaterial({ color: '#2a5a8c', shininess: 30 })

  // Hull — tapered shape using lathe
  const hullShape = new THREE.Shape()
  hullShape.moveTo(-5, -2.5)
  hullShape.lineTo(-5, 0)
  hullShape.quadraticCurveTo(-4.5, 1.5, 0, 1.8)
  hullShape.quadraticCurveTo(4.5, 1.5, 6, 0)
  hullShape.lineTo(7.5, -0.5)
  hullShape.lineTo(6, -1.5)
  hullShape.lineTo(-5, -2.5)
  const hullGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 5, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.2, bevelSegments: 3 })
  hullGeo.translate(0, 0, -2.5)
  g.add(new THREE.Mesh(hullGeo, mat))

  // Deck
  g.add(new THREE.Mesh(new THREE.BoxGeometry(10, 0.3, 4.5), new THREE.MeshPhongMaterial({ color: '#8B7355', shininess: 20 })))
  g.children[g.children.length - 1].position.set(0, 0.1, 0)

  // Bridge (cabin)
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 3, 2, 2, 2), matLight)
  bridge.position.set(-2, 1.5, 0)
  g.add(bridge)

  // Bridge windows
  const winMat = new THREE.MeshPhongMaterial({ color: '#88CCFF', transparent: true, opacity: 0.7, shininess: 80 })
  for (const z of [-1, 0, 1]) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.8), winMat)
    win.position.set(-0.7, 2.2, z * 0.9)
    win.rotation.y = Math.PI / 2
    g.add(win)
  }

  // Funnel
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 1.8, 12), new THREE.MeshPhongMaterial({ color: '#CC3333', shininess: 30 }))
  funnel.position.set(-2, 3.7, 0)
  g.add(funnel)

  // Mast
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4, 8), new THREE.MeshPhongMaterial({ color: '#888' }))
  mast.position.set(2, 2.2, 0)
  g.add(mast)

  // Containers on deck
  const contColors = ['#0066AA', '#CC6600', '#CC3333']
  for (let i = 0; i < 3; i++) {
    const cont = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1.2, 1.8),
      new THREE.MeshPhongMaterial({ color: contColors[i], shininess: 20 }),
    )
    cont.position.set(1 + i * 2.2, 0.9, 0)
    g.add(cont)
  }

  return g
}

function buildWharf(THREE: typeof import('three')): import('three').Group {
  const g = new THREE.Group()
  const woodMat = new THREE.MeshPhongMaterial({ color: '#8B7355', shininess: 15 })
  const woodDark = new THREE.MeshPhongMaterial({ color: '#6B5340', shininess: 10 })
  const metalMat = new THREE.MeshPhongMaterial({ color: '#555', shininess: 60 })

  // Main platform with planks
  const platform = new THREE.Mesh(new THREE.BoxGeometry(14, 0.8, 9), woodMat)
  g.add(platform)

  // Plank lines
  for (let z = -4; z <= 4; z += 1) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(14.1, 0.05, 0.05), woodDark)
    plank.position.set(0, 0.42, z)
    g.add(plank)
  }

  // Pillars — thicker, rounded
  for (const x of [-5, -1.5, 2, 5.5]) {
    for (const z of [-3.5, 0, 3.5]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 6, 12), woodDark)
      pillar.position.set(x, -3.4, z)
      g.add(pillar)
    }
  }

  // Bollards
  for (const x of [-4, 0, 4]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.8, 12), metalMat)
    post.position.set(x, 1.3, 4)
    g.add(post)
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), metalMat)
    cap.position.set(x, 2.3, 4)
    g.add(cap)
  }

  // Crane arm (simple)
  const craneMat = new THREE.MeshPhongMaterial({ color: '#CC6600', shininess: 40 })
  const craneBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4, 1.2), craneMat)
  craneBase.position.set(6, 2.4, 0)
  g.add(craneBase)
  const craneArm = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 0.5), craneMat)
  craneArm.position.set(2, 4.6, 0)
  g.add(craneArm)

  return g
}

function buildContainer(THREE: typeof import('three')): import('three').Group {
  const g = new THREE.Group()
  const bodyMat = new THREE.MeshPhongMaterial({ color: '#0066AA', shininess: 30 })

  // Main body
  const body = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 4), bodyMat)
  g.add(body)

  // Edges
  g.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(8, 5, 4)),
    new THREE.LineBasicMaterial({ color: '#003366' }),
  ))

  // Corrugation — more ridges, thinner
  for (let i = -3.5; i <= 3.5; i += 0.6) {
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 4.8, 4.05),
      new THREE.MeshPhongMaterial({ color: '#004488', shininess: 20 }),
    )
    ridge.position.set(i, 0, 0)
    g.add(ridge)
  }

  // Door handles (back face)
  const handleMat = new THREE.MeshPhongMaterial({ color: '#888', shininess: 60 })
  for (const y of [-0.8, 0.8]) {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8), handleMat)
    handle.position.set(-4.05, y, 0)
    handle.rotation.z = Math.PI / 2
    g.add(handle)
  }

  // Lock bar
  const lockBar = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4.5, 0.15), handleMat)
  lockBar.position.set(-4.05, 0, 0)
  g.add(lockBar)

  // Corner castings
  const castMat = new THREE.MeshPhongMaterial({ color: '#333', shininess: 40 })
  for (const x of [-3.9, 3.9]) {
    for (const y of [-2.4, 2.4]) {
      for (const z of [-1.9, 1.9]) {
        const cast = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), castMat)
        cast.position.set(x, y, z)
        g.add(cast)
      }
    }
  }

  return g
}

function buildOpenBox(THREE: typeof import('three')): import('three').Group {
  const g = new THREE.Group()
  const cardboard = new THREE.MeshPhongMaterial({ color: '#C4956A', shininess: 8 })
  const cardboardInner = new THREE.MeshPhongMaterial({ color: '#D4A574', shininess: 5 })
  const tapeMat = new THREE.MeshPhongMaterial({ color: '#CC9933', shininess: 15 })

  // Base
  g.add(new THREE.Mesh(new THREE.BoxGeometry(7, 0.4, 5), cardboard))

  // Walls — all 4 sides
  const wallH = 4
  const wallBack = new THREE.Mesh(new THREE.BoxGeometry(7, wallH, 0.3), cardboardInner)
  wallBack.position.set(0, wallH / 2, -2.5)
  g.add(wallBack)
  const wallFront = new THREE.Mesh(new THREE.BoxGeometry(7, wallH, 0.3), cardboardInner)
  wallFront.position.set(0, wallH / 2, 2.5)
  g.add(wallFront)
  const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallH, 5), cardboardInner)
  wallLeft.position.set(-3.5, wallH / 2, 0)
  g.add(wallLeft)
  const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallH, 5), cardboardInner)
  wallRight.position.set(3.5, wallH / 2, 0)
  g.add(wallRight)

  // Flaps — two open, two folded in
  // Back flap (open, tilted back)
  const flapBack = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.2, 2.5), cardboard)
  flapBack.position.set(0, 4.2, -3.8)
  flapBack.rotation.x = -0.7
  g.add(flapBack)

  // Front flap (open, tilted forward)
  const flapFront = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.2, 2.5), cardboard)
  flapFront.position.set(0, 4.2, 3.8)
  flapFront.rotation.x = 0.5
  g.add(flapFront)

  // Side flaps (folded inward)
  const flapLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 4.6), cardboard)
  flapLeft.position.set(-3.4, 4.1, 0)
  flapLeft.rotation.z = 0.3
  g.add(flapLeft)

  const flapRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 4.6), cardboard)
  flapRight.position.set(3.4, 4.1, 0)
  flapRight.rotation.z = -0.3
  g.add(flapRight)

  // Tape strips
  const tape1 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.5, 0.05), tapeMat)
  tape1.position.set(0, 2, 2.52)
  g.add(tape1)
  const tape2 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.5, 0.05), tapeMat)
  tape2.position.set(0, 2, -2.52)
  g.add(tape2)

  // Items peeking out — small colored boxes inside
  const itemMat1 = new THREE.MeshPhongMaterial({ color: '#4488CC', shininess: 30 })
  const item1 = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 1.5), itemMat1)
  item1.position.set(-1, 3.5, 0.5)
  item1.rotation.y = 0.2
  g.add(item1)

  const itemMat2 = new THREE.MeshPhongMaterial({ color: '#CC4444', shininess: 30 })
  const item2 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 2, 12), itemMat2)
  item2.position.set(1.5, 3.2, -0.5)
  g.add(item2)

  return g
}

function buildTruck(THREE: typeof import('three')): import('three').Group {
  const g = new THREE.Group()
  const trailerMat = new THREE.MeshPhongMaterial({ color: '#25BA3B', shininess: 30 })
  const cabMat = new THREE.MeshPhongMaterial({ color: '#1a8a2a', shininess: 35 })
  const metalMat = new THREE.MeshPhongMaterial({ color: '#666', shininess: 60 })
  const winMat = new THREE.MeshPhongMaterial({ color: '#88CCFF', transparent: true, opacity: 0.7, shininess: 80 })
  const wheelMat = new THREE.MeshPhongMaterial({ color: '#222', shininess: 20 })
  const tireMat = new THREE.MeshPhongMaterial({ color: '#111', shininess: 5 })

  // Trailer body — rounded edges
  const trailer = new THREE.Mesh(new THREE.BoxGeometry(9, 4.5, 4.2, 2, 2, 2), trailerMat)
  g.add(trailer)

  // Trailer ridges (sides)
  for (let x = -4; x <= 4; x += 0.8) {
    for (const z of [-2.12, 2.12]) {
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 4.3, 0.06), new THREE.MeshPhongMaterial({ color: '#1a7a2a' }))
      ridge.position.set(x, 0, z)
      g.add(ridge)
    }
  }

  // Cab
  const cab = new THREE.Mesh(new THREE.BoxGeometry(3.5, 4, 4, 2, 2, 2), cabMat)
  cab.position.set(6.2, 0, 0)
  g.add(cab)

  // Windshield
  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.5), winMat)
  windshield.position.set(8, 0.5, 0)
  windshield.rotation.y = Math.PI / 2
  g.add(windshield)

  // Side windows
  for (const z of [-2.02, 2.02]) {
    const sideWin = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.5), winMat)
    sideWin.position.set(6.2, 0.5, z)
    sideWin.rotation.y = z > 0 ? 0 : Math.PI
    g.add(sideWin)
  }

  // Headlights
  const lightMat = new THREE.MeshPhongMaterial({ color: '#FFEE88', emissive: '#443300', shininess: 80 })
  for (const z of [-1.2, 1.2]) {
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), lightMat)
    light.position.set(7.95, -0.8, z)
    g.add(light)
  }

  // Bumper
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 4.4), metalMat)
  bumper.position.set(8, -1.5, 0)
  g.add(bumper)

  // Wheels — more detailed
  for (const x of [-3, 0.5, 5, 6.5]) {
    for (const z of [-2.3, 2.3]) {
      // Tire
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.35, 12, 16), tireMat)
      tire.rotation.y = Math.PI / 2
      tire.position.set(x, -2.6, z)
      g.add(tire)
      // Hub
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12), metalMat)
      hub.rotation.x = Math.PI / 2
      hub.position.set(x, -2.6, z)
      g.add(hub)
    }
  }

  // Mudflaps
  for (const z of [-2.5, 2.5]) {
    const flap = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1, 0.05), new THREE.MeshPhongMaterial({ color: '#111' }))
    flap.position.set(-3.8, -2.2, z)
    g.add(flap)
  }

  // Checkmark on trailer (collected = done)
  const checkCanvas = document.createElement('canvas')
  const checkCtx = checkCanvas.getContext('2d')!
  checkCanvas.width = 128
  checkCanvas.height = 128
  checkCtx.font = 'bold 80px sans-serif'
  checkCtx.fillStyle = 'white'
  checkCtx.textAlign = 'center'
  checkCtx.textBaseline = 'middle'
  checkCtx.fillText('✓', 64, 64)
  const checkTex = new THREE.CanvasTexture(checkCanvas)
  const checkMat = new THREE.SpriteMaterial({ map: checkTex, transparent: true })
  const checkSprite = new THREE.Sprite(checkMat)
  checkSprite.scale.set(3, 3, 1)
  checkSprite.position.set(0, 0, 2.2)
  g.add(checkSprite)

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
    // Connect to actor AND nearest milestone
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
    // Connect to applies_to AND nearest milestone
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
        spinePoints.push(new THREE.Vector3((states.length - 1) * SPINE_SPACING + 8, 0, 0))

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
          let topY = 4 // default label offset

          if (node.type === 'actor') {
            // Person icon: head sphere + body (half-sphere torso)
            const personMat = new THREE.MeshPhongMaterial({ color, shininess: 40 })
            // Head
            const head = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 16), personMat)
            head.position.set(0, 3.5, 0)
            group.add(head)
            // Body (wide sphere, clipped by position)
            const body = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), personMat)
            body.rotation.x = Math.PI
            body.position.set(0, 1, 0)
            group.add(body)
            // Shoulders
            const shoulder = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 4), personMat)
            shoulder.rotation.x = Math.PI
            shoulder.position.set(0, 1.2, 0)
            group.add(shoulder)
            topY = 7

          } else if (node.type === 'journey') {
            // Cursor/pointer arrow — extruded 2D arrow shape with depth
            const cursorMat = new THREE.MeshPhongMaterial({ color, shininess: 50 })
            const shape = new THREE.Shape()
            // Classic cursor arrow outline (scaled to ~6 units tall)
            shape.moveTo(0, 6)      // tip
            shape.lineTo(-1.8, 1.5) // left edge
            shape.lineTo(-0.8, 1.8) // notch left
            shape.lineTo(-2.2, -1)  // tail left
            shape.lineTo(-1, -0.5)  // tail inner left
            shape.lineTo(0, 2)      // center bottom
            shape.lineTo(1, -0.5)   // tail inner right
            shape.lineTo(2.2, -1)   // tail right
            shape.lineTo(0.8, 1.8)  // notch right
            shape.lineTo(1.8, 1.5)  // right edge
            shape.lineTo(0, 6)      // back to tip

            const cursorGeo = new THREE.ExtrudeGeometry(shape, {
              depth: 1.5,
              bevelEnabled: true,
              bevelThickness: 0.2,
              bevelSize: 0.15,
              bevelSegments: 2,
            })
            cursorGeo.translate(0, -3, -0.75) // center it
            group.add(new THREE.Mesh(cursorGeo, cursorMat))
            topY = 5

          } else if (node.type === 'rule') {
            // Cube with beveled edges
            const ruleMat = new THREE.MeshPhongMaterial({ color, shininess: 30 })
            const cube = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4, 2, 2, 2), ruleMat)
            group.add(cube)
            // Edge wireframe
            const edges = new THREE.LineSegments(
              new THREE.EdgesGeometry(new THREE.BoxGeometry(4, 4, 4)),
              new THREE.LineBasicMaterial({ color: '#CC8800' }),
            )
            group.add(edges)
            topY = 4

          } else if (node.type === 'constraint') {
            // Octahedron (stop sign shape)
            const constMat = new THREE.MeshPhongMaterial({ color, shininess: 40 })
            group.add(new THREE.Mesh(new THREE.OctahedronGeometry(3, 0), constMat))
            topY = 5

          } else {
            // Entity / default: sphere
            const radius = Math.max(3, 2 + Math.min(node.val, 15) * 0.2)
            const mat = new THREE.MeshPhongMaterial({ color, shininess: 30, transparent: true, opacity: 0.85 })
            group.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), mat))
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
          const spriteW = 22
          label.scale.set(spriteW, spriteW * (canvasH / canvasW), 1)
          label.position.set(0, topY + 1.5, 0)
          group.add(label)

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
