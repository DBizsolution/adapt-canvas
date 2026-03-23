import type { IntentModel } from '@/domain/intent-model/types'

export type ItemType = 'entity' | 'actor' | 'journey' | 'rule' | 'constraint' | 'question'

export type CardSize = 'large' | 'medium' | 'small'

export type CardNode = {
  id: string
  name: string
  type: ItemType
  stat: string            // e.g. "6 fields · 5 states"
  icon: string            // lucide icon name
  size: CardSize
  position: [number, number, number]
  deferred?: boolean
}

export type ConnectionEdge = {
  id: string
  from: string            // CardNode id
  to: string              // CardNode id
  color?: string          // override default gray
  visible?: boolean       // Galaxy hides by default
  animated?: boolean
  thickness?: number
}

export type ViewProps = {
  model: IntentModel
}
