import dagre from '@dagrejs/dagre'
import type { Node, Edge } from '@xyflow/react'
import type { IntentModel, Entity } from '@/domain/intent-model/types'
import type {
  ExplorerGraphData, ExplorerNodeData, EntityRelationships, SatelliteNodeData,
} from './explorer-types'
import { ENTITY_COLOR, SATELLITE_COLORS } from './explorer-types'

// --- Layout constants ---

const NODE_WIDTH = 200
const NODE_HEIGHT = 70
const SATELLITE_RADIUS = 250

// --- Edge style constants ---

const ENTITY_EDGE_STYLE = {
  stroke: '#9CA3AF',
  strokeWidth: 1.5,
}

const ENTITY_ARROW = {
  type: 'arrowclosed' as const,
  width: 10,
  height: 10,
  color: '#9CA3AF',
}

// --- Helper: extract abbreviation from entity name ---
// e.g. "House Bill of Lading (HBL)" -> "HBL"

function extractAbbreviation(name: string): string | null {
  const match = name.match(/\(([A-Z][A-Z0-9]+)\)/)
  return match ? match[1] : null
}

// --- Helper: build word-boundary regex for a term ---

function wordBoundaryRegex(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`, 'i')
}

// --- findEntityEdges ---
// Scans key_fields descriptions and lifecycle transition triggers/guards
// for references to other entities (by id, lowercase name, or abbreviation).

export function findEntityEdges(
  entities: Entity[],
): Map<string, EntityRelationships['entityEdges']> {
  const result = new Map<string, EntityRelationships['entityEdges']>()

  for (const entity of entities) {
    const edges: EntityRelationships['entityEdges'] = []

    for (const other of entities) {
      if (other.id === entity.id) continue

      const abbrev = extractAbbreviation(other.name)
      const patterns = [
        wordBoundaryRegex(other.id),
        wordBoundaryRegex(other.name.replace(/\s*\([^)]+\)/, '').trim()),
        ...(abbrev ? [wordBoundaryRegex(abbrev)] : []),
      ]

      const matchesAny = (text: string) => patterns.some((re) => re.test(text))

      // Scan key_fields descriptions
      const fieldReason = entity.key_fields.find((f) => matchesAny(f.description))
      if (fieldReason) {
        edges.push({
          targetEntityId: other.id,
          reason: `field "${fieldReason.name}" references ${other.name}`,
        })
        continue
      }

      // Scan lifecycle transitions (trigger + guard)
      const transitionReason = entity.lifecycle.transitions.find(
        (t) => matchesAny(t.trigger) || (t.guard ? matchesAny(t.guard) : false),
      )
      if (transitionReason) {
        edges.push({
          targetEntityId: other.id,
          reason: `transition "${transitionReason.from} → ${transitionReason.to}" references ${other.name}`,
        })
      }
    }

    result.set(entity.id, edges)
  }

  return result
}

// --- findRelationships ---
// Finds model items that reference the given entity.

export function findRelationships(entity: Entity, model: IntentModel): EntityRelationships {
  const abbrev = extractAbbreviation(entity.name)
  const baseName = entity.name.replace(/\s*\([^)]+\)/, '').trim()
  const patterns = [
    wordBoundaryRegex(entity.id),
    wordBoundaryRegex(baseName),
    ...(abbrev ? [wordBoundaryRegex(abbrev)] : []),
  ]

  const matchesAny = (text: string) => patterns.some((re) => re.test(text))

  // Business rules: check applies_to list and description
  const rules = model.business_rules.filter((br) => {
    if (br.applies_to.some((ref) => matchesAny(ref))) return true
    if (matchesAny(br.description)) return true
    return false
  })

  // Journeys: check name, preconditions, step titles and details
  const journeys = model.journeys.filter((j) => {
    if (matchesAny(j.name)) return true
    if (j.preconditions.some((p) => matchesAny(p))) return true
    if (j.steps.some((s) => matchesAny(s.title) || matchesAny(s.detail))) return true
    return false
  })

  // Actors: check responsibilities
  const actors = model.actors.filter((a) =>
    a.responsibilities.some((r) => matchesAny(r.description)),
  )

  // Constraints: check constraint text
  const constraints = model.constraints.filter((c) => matchesAny(c.constraint))

  // Open questions: check question text and reason
  const openQuestions = model.open_questions.filter(
    (oq) => matchesAny(oq.question) || matchesAny(oq.reason),
  )

  // Entity edges are computed separately — return empty here
  return {
    entityEdges: [],
    rules,
    journeys,
    actors,
    constraints,
    openQuestions,
  }
}

// --- layoutEntities ---
// Runs dagre layout on entity nodes using their cross-reference edges.

function layoutEntities(
  entities: Entity[],
  entityEdgesPerEntity: Map<string, EntityRelationships['entityEdges']>,
): Map<string, { x: number; y: number }> {
  const g = new dagre.graphlib.Graph()
  g.setGraph({
    rankdir: 'LR',
    nodesep: 80,
    ranksep: 120,
    marginx: 60,
    marginy: 60,
  })
  g.setDefaultEdgeLabel(() => ({}))

  for (const entity of entities) {
    g.setNode(entity.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }

  const addedEdges = new Set<string>()
  for (const entity of entities) {
    const edges = entityEdgesPerEntity.get(entity.id) ?? []
    for (const edge of edges) {
      const key = [entity.id, edge.targetEntityId].sort().join('--')
      if (!addedEdges.has(key)) {
        g.setEdge(entity.id, edge.targetEntityId)
        addedEdges.add(key)
      }
    }
  }

  dagre.layout(g)

  const positions = new Map<string, { x: number; y: number }>()
  for (const entity of entities) {
    const node = g.node(entity.id)
    if (node) {
      positions.set(entity.id, {
        x: node.x - NODE_WIDTH / 2,
        y: node.y - NODE_HEIGHT / 2,
      })
    }
  }

  return positions
}

// --- buildSatelliteNodes ---
// Generates satellite nodes in a radial layout around an entity node.

export function buildSatelliteNodes(
  entityId: string,
  entityPosition: { x: number; y: number },
  relationships: EntityRelationships,
): { nodes: Node<SatelliteNodeData>[]; edges: Edge[] } {
  type SatelliteGroup = {
    type: SatelliteNodeData['itemType']
    items: { id: string; label: string; item: SatelliteNodeData['item'] }[]
  }

  const allGroups: SatelliteGroup[] = [
    {
      type: 'business_rule' as const,
      items: relationships.rules.map((r) => ({ id: r.id, label: r.id, item: r })),
    },
    {
      type: 'journey' as const,
      items: relationships.journeys.map((j) => ({ id: j.id, label: j.name, item: j })),
    },
    {
      type: 'actor' as const,
      items: relationships.actors.map((a) => ({ id: a.id, label: a.name, item: a })),
    },
    {
      type: 'constraint' as const,
      items: relationships.constraints.map((c) => ({ id: c.id, label: c.id, item: c })),
    },
    {
      type: 'open_question' as const,
      items: relationships.openQuestions.map((oq) => ({ id: oq.id, label: oq.id, item: oq })),
    },
  ]
  const groups = allGroups.filter((g) => g.items.length > 0)

  // Total satellites for angle distribution
  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0)
  if (totalItems === 0) return { nodes: [], edges: [] }

  const nodes: Node<SatelliteNodeData>[] = []
  const edges: Edge[] = []

  // Center of the entity node
  const cx = entityPosition.x + NODE_WIDTH / 2
  const cy = entityPosition.y + NODE_HEIGHT / 2

  let globalIndex = 0

  for (const group of groups) {
    const color = SATELLITE_COLORS[group.type]

    for (const item of group.items) {
      const angle = (2 * Math.PI * globalIndex) / totalItems - Math.PI / 2
      const sx = cx + SATELLITE_RADIUS * Math.cos(angle)
      const sy = cy + SATELLITE_RADIUS * Math.sin(angle)

      const nodeId = `satellite-${entityId}-${item.id}`

      nodes.push({
        id: nodeId,
        type: 'satellite',
        position: { x: sx - 80, y: sy - 16 },
        data: {
          itemType: group.type,
          itemId: item.id,
          label: item.label,
          item: item.item,
        },
        draggable: false,
        selectable: false,
      })

      edges.push({
        id: `satellite-edge-${entityId}-${item.id}`,
        source: entityId,
        target: nodeId,
        sourceHandle: 'right',
        targetHandle: 'left',
        style: {
          stroke: color,
          strokeWidth: 1.2,
          strokeDasharray: '5 4',
          opacity: 0.6,
        },
        markerEnd: {
          type: 'arrowclosed' as const,
          width: 8,
          height: 8,
          color,
        },
      })

      globalIndex++
    }
  }

  return { nodes, edges }
}

// --- buildExplorerGraph ---
// Main export. Returns dagre-positioned entity nodes, deduplicated edges,
// and a relationship map for each entity.

export function buildExplorerGraph(model: IntentModel): ExplorerGraphData {
  const { entities } = model

  // Step 1: compute cross-reference edges per entity
  const entityEdgesPerEntity = findEntityEdges(entities)

  // Step 2: compute full relationships per entity
  const relationshipMap = new Map<string, EntityRelationships>()
  for (const entity of entities) {
    const rels = findRelationships(entity, model)
    rels.entityEdges = entityEdgesPerEntity.get(entity.id) ?? []
    relationshipMap.set(entity.id, rels)
  }

  // Step 3: dagre layout
  const positions = layoutEntities(entities, entityEdgesPerEntity)

  // Step 4: build entity nodes
  const entityNodes: Node<ExplorerNodeData>[] = entities.map((entity) => ({
    id: entity.id,
    type: 'explorer',
    position: positions.get(entity.id) ?? { x: 0, y: 0 },
    data: {
      entityId: entity.id,
      name: entity.name,
      fieldCount: entity.key_fields.length,
      stateCount: entity.lifecycle.states.length,
      description: entity.description,
    },
  }))

  // Step 5: build deduplicated entity-to-entity edges
  // Sort source+target to avoid A→B and B→A duplicates
  const seenEdgeKeys = new Set<string>()
  const entityEdges: Edge[] = []

  for (const entity of entities) {
    const edges = entityEdgesPerEntity.get(entity.id) ?? []
    for (const edge of edges) {
      const key = [entity.id, edge.targetEntityId].sort().join('--')
      if (seenEdgeKeys.has(key)) continue
      seenEdgeKeys.add(key)

      entityEdges.push({
        id: `entity-edge-${key}`,
        source: entity.id,
        target: edge.targetEntityId,
        sourceHandle: 'right',
        targetHandle: 'left',
        style: ENTITY_EDGE_STYLE,
        markerEnd: ENTITY_ARROW,
        label: edge.reason.length > 40 ? edge.reason.slice(0, 40) + '…' : edge.reason,
        labelStyle: {
          fontSize: 10,
          fontWeight: 500,
          fill: '#9CA3AF',
          fontFamily: 'var(--font-sans)',
        },
        labelBgStyle: {
          fill: 'var(--bg-page)',
          fillOpacity: 0.9,
        },
        labelBgPadding: [4, 6] as [number, number],
        labelBgBorderRadius: 4,
      })
    }
  }

  return {
    entityNodes,
    entityEdges,
    relationshipMap,
  }
}

// Export ENTITY_COLOR for use in canvas
export { ENTITY_COLOR }
