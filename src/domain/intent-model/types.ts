export type IntentModel = {
  meta: ModelMeta
  actors: Actor[]
  entities: Entity[]
  journeys: Journey[]
  business_rules: BusinessRule[]
  constraints: Constraint[]
  open_questions: OpenQuestion[]
}

export type ModelMeta = {
  version: string
  project: string
  lastUpdated: string
  status: 'draft' | 'in_review' | 'approved'
}

export type Actor = {
  id: string
  name: string
  description: string
  auth: string
  responsibilities: Responsibility[]
}

export type Responsibility = {
  id: string
  description: string
  warn?: string
  edge?: string
}

export type Entity = {
  id: string
  name: string
  description: string
  key_fields: Field[]
  lifecycle: {
    states: string[]
    transitions: Transition[]
  }
}

export type Field = {
  name: string
  type: string
  description: string
  warn?: string
}

export type Transition = {
  from: string
  to: string
  trigger: string
  guard?: string
  warn?: string
}

export type Journey = {
  id: string
  name: string
  primary_actor: string
  preconditions: string[]
  steps: JourneyStep[]
  success_outcome: string
}

export type JourneyStep = {
  order: number
  title: string
  detail: string
  precondition?: string
  warn?: string
  edge?: string
}

export type BusinessRule = {
  id: string
  description: string
  applies_to: string[]
  source: string
  warn?: string
}

export type Constraint = {
  id: string
  constraint: string
  type: 'capacity' | 'pricing' | 'access' | 'compliance' | 'temporal'
}

export type OpenQuestion = {
  id: string
  question: string
  reason: string
  status: 'open' | 'deferred' | 'resolved'
  resolution?: string
}

// --- Review State Types ---

export type SectionType = 'actor' | 'entity' | 'journey' | 'business_rule' | 'constraint' | 'open_question'

export type ReviewState = {
  modelVersion: string
  reviewers: Reviewer[]
  sections: SectionReview[]
}

export type Reviewer = {
  id: string
  name: string
  role: 'designer' | 'product_owner' | 'tech_lead' | 'engineer' | 'qa'
  focus: string[]
}

export type SectionReview = {
  targetId: string
  targetType: SectionType
  status: 'pending' | 'approved' | 'disputed'
  contentHash: string
  reviews: Review[]
}

export type Review = {
  reviewerId: string
  status: 'approved' | 'disputed'
  comment?: string
  timestamp: string
}

export type ConsensusStatus = {
  totalSections: number
  approved: number
  disputed: number
  pending: number
  revised: number
  ready: boolean
}

// --- Mapping utilities ---

export const SECTION_TYPE_TO_MODEL_KEY: Record<SectionType, keyof IntentModel> = {
  actor: 'actors',
  entity: 'entities',
  journey: 'journeys',
  business_rule: 'business_rules',
  constraint: 'constraints',
  open_question: 'open_questions',
}

export const MODEL_KEY_TO_SECTION_TYPE: Record<string, SectionType> = {
  actors: 'actor',
  entities: 'entity',
  journeys: 'journey',
  business_rules: 'business_rule',
  constraints: 'constraint',
  open_questions: 'open_question',
}

export const SECTION_TYPE_TO_URL_PARAM: Record<SectionType, string> = {
  actor: 'actors',
  entity: 'entities',
  journey: 'journeys',
  business_rule: 'business-rules',
  constraint: 'constraints',
  open_question: 'open-questions',
}

export const URL_PARAM_TO_SECTION_TYPE: Record<string, SectionType> = {
  actors: 'actor',
  entities: 'entity',
  journeys: 'journey',
  'business-rules': 'business_rule',
  constraints: 'constraint',
  'open-questions': 'open_question',
}
