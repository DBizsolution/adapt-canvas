import OpenAI from 'openai'
import type { IntentModel, SectionType } from '@/domain/intent-model/types'
import { SECTION_TYPE_TO_MODEL_KEY } from '@/domain/intent-model/types'
import { IntentModelSchema, SectionSchemas } from './model-schemas'

const openai = new OpenAI()

const TYPE_DEFINITIONS = `
type IntentModel = {
  meta: { version: string; project: string; lastUpdated: string; status: 'draft' | 'in_review' | 'approved' }
  actors: Actor[]
  entities: Entity[]
  journeys: Journey[]
  business_rules: BusinessRule[]
  constraints: Constraint[]
  open_questions: OpenQuestion[]
}

type Actor = {
  id: string          // short lowercase, e.g. 'wff', 'acfs'
  name: string
  description: string
  auth: string
  responsibilities: { id: string; description: string; warn?: string; edge?: string }[]
  // responsibility IDs follow pattern: actorId:rN (e.g. 'wff:r1')
}

type Entity = {
  id: string
  name: string
  description: string
  key_fields: { name: string; type: string; description: string; warn?: string }[]
  lifecycle: {
    states: string[]
    transitions: { from: string; to: string; trigger: string; guard?: string; warn?: string }[]
  }
}

type Journey = {
  id: string           // kebab-case, e.g. 'carrier-books-pickup'
  name: string
  primary_actor: string  // must reference an existing actor ID
  preconditions: string[]
  steps: { order: number; title: string; detail: string; precondition?: string; warn?: string; edge?: string }[]
  success_outcome: string
}

type BusinessRule = {
  id: string           // pattern: 'BR-NNN'
  description: string
  applies_to: string[] // must reference existing actor or entity IDs
  source: string
  warn?: string
}

type Constraint = {
  id: string           // pattern: 'C-NNN'
  constraint: string
  type: 'capacity' | 'pricing' | 'access' | 'compliance' | 'temporal'
}

type OpenQuestion = {
  id: string           // pattern: 'OQ-NNN'
  question: string
  reason: string
  status: 'open' | 'deferred' | 'resolved'
  resolution?: string
}
`

function buildSystemPrompt(scope: 'full' | 'section', sectionType?: SectionType): string {
  const scopeInstruction = scope === 'full'
    ? 'Return the complete updated IntentModel as valid JSON.'
    : `Return only the updated "${sectionType}" section as a JSON object with a single key "${SECTION_TYPE_TO_MODEL_KEY[sectionType!]}".`

  return `You are an expert business analyst editing a structured intent model for a software project.

## Type Definitions
${TYPE_DEFINITIONS}

## Rules
- ${scopeInstruction}
- Preserve ALL existing data unless the user's prompt explicitly asks to change it.
- Preserve all "warn" and "edge" annotations unless the user specifically asks to modify them.
- Generate sequential IDs following existing patterns (e.g. if actors have wff, ff, carrier, acfs — a new actor gets a short lowercase ID).
- Return ONLY valid JSON. No markdown, no explanation, no wrapping.`
}

export type EditRequest = {
  prompt: string
  scope: 'full' | 'section'
  sectionType?: SectionType
  currentModel: IntentModel
}

export type EditResponse = {
  model: IntentModel
}

export async function callOpenAI(req: EditRequest): Promise<EditResponse> {
  const systemPrompt = buildSystemPrompt(req.scope, req.sectionType)

  let userContent: string
  if (req.scope === 'section' && req.sectionType) {
    const modelKey = SECTION_TYPE_TO_MODEL_KEY[req.sectionType]
    userContent = `## Current full model (read-only context)
${JSON.stringify(req.currentModel, null, 2)}

## Section to edit: ${modelKey}
${JSON.stringify(req.currentModel[modelKey], null, 2)}

## Edit instruction
${req.prompt}`
  } else {
    userContent = `## Current model
${JSON.stringify(req.currentModel, null, 2)}

## Edit instruction
${req.prompt}`
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.2,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Empty response from OpenAI')

  const parsed = JSON.parse(content)

  // Validate with zod
  if (req.scope === 'section' && req.sectionType) {
    const modelKey = SECTION_TYPE_TO_MODEL_KEY[req.sectionType]
    const schema = SectionSchemas[modelKey as keyof typeof SectionSchemas]
    const result = schema.parse(parsed)
    // Merge back into full model
    const merged = structuredClone(req.currentModel)
    ;(merged as Record<string, unknown>)[modelKey] = (result as Record<string, unknown>)[modelKey]
    return { model: merged }
  }

  const validated = IntentModelSchema.parse(parsed)
  return { model: validated as IntentModel }
}
