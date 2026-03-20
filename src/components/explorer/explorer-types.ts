import type { Node, Edge } from '@xyflow/react'
import type {
  Actor, Journey, BusinessRule, Constraint, OpenQuestion,
} from '@/domain/intent-model/types'

// --- Node data types ---

export type ExplorerNodeData = {
  entityId: string
  name: string
  fieldCount: number
  stateCount: number
  description: string
}

export type SatelliteNodeData = {
  itemType: 'business_rule' | 'journey' | 'actor' | 'constraint' | 'open_question'
  itemId: string
  label: string
  item: BusinessRule | Journey | Actor | Constraint | OpenQuestion
}

// --- Relationship types ---

export type EntityRelationships = {
  entityEdges: { targetEntityId: string; reason: string }[]
  rules: BusinessRule[]
  journeys: Journey[]
  actors: Actor[]
  constraints: Constraint[]
  openQuestions: OpenQuestion[]
}

// --- Graph output ---

export type ExplorerGraphData = {
  entityNodes: Node<ExplorerNodeData>[]
  entityEdges: Edge[]
  relationshipMap: Map<string, EntityRelationships>
}

// --- Color constants ---

export const SATELLITE_COLORS: Record<SatelliteNodeData['itemType'], string> = {
  business_rule: '#F59E0B',
  journey: '#10B981',
  actor: '#8B5CF6',
  constraint: '#EF4444',
  open_question: '#EC4899',
}

export const SATELLITE_LABELS: Record<SatelliteNodeData['itemType'], string> = {
  business_rule: 'Rule',
  journey: 'Journey',
  actor: 'Actor',
  constraint: 'Constraint',
  open_question: 'Question',
}

export const ENTITY_COLOR = '#0081F2'
