import type {
  IntentModel,
  ReviewState,
  SectionReview,
  SectionType,
  ConsensusStatus,
} from '@/domain/intent-model/types'
import { MODEL_KEY_TO_SECTION_TYPE, SECTION_TYPE_TO_MODEL_KEY } from '@/domain/intent-model/types'

// --- Hashing ---

function sortedStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj)
  if (Array.isArray(obj)) return '[' + obj.map(sortedStringify).join(',') + ']'
  const sorted = Object.keys(obj as Record<string, unknown>).sort()
  return '{' + sorted.map(k => JSON.stringify(k) + ':' + sortedStringify((obj as Record<string, unknown>)[k])).join(',') + '}'
}

export async function hashItem(item: unknown): Promise<string> {
  const json = sortedStringify(item)
  const encoder = new TextEncoder()
  const data = encoder.encode(json)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// --- Model item extraction ---

type ModelItem = { id: string; [key: string]: unknown }

export function getAllModelItems(model: IntentModel): Array<{ item: ModelItem; type: SectionType }> {
  const items: Array<{ item: ModelItem; type: SectionType }> = []
  const { meta, ...sections } = model

  for (const [key, value] of Object.entries(sections)) {
    const sectionType = MODEL_KEY_TO_SECTION_TYPE[key]
    if (!sectionType || !Array.isArray(value)) continue
    for (const item of value) {
      items.push({ item: item as ModelItem, type: sectionType })
    }
  }

  return items
}

export function buildTargetId(type: SectionType, id: string): string {
  return `${type}:${id}`
}

// --- Staleness detection ---

export type EnrichedSectionReview = SectionReview & {
  isRevised: boolean
  effectiveStatus: 'pending' | 'approved' | 'disputed' | 'revised'
}

export async function enrichSectionReviews(
  model: IntentModel,
  reviewState: ReviewState
): Promise<EnrichedSectionReview[]> {
  const modelItems = getAllModelItems(model)
  const enriched: EnrichedSectionReview[] = []

  for (const { item, type } of modelItems) {
    const targetId = buildTargetId(type, item.id)
    const existing = reviewState.sections.find(s => s.targetId === targetId)
    const currentHash = await hashItem(item)

    if (existing) {
      const isRevised = existing.contentHash !== currentHash
      enriched.push({
        ...existing,
        isRevised,
        effectiveStatus: isRevised ? 'revised' : existing.status,
      })
    } else {
      enriched.push({
        targetId,
        targetType: type,
        status: 'pending',
        contentHash: currentHash,
        reviews: [],
        isRevised: false,
        effectiveStatus: 'pending',
      })
    }
  }

  return enriched
}

// --- Consensus computation ---

export function computeConsensus(
  enrichedSections: EnrichedSectionReview[],
  reviewers: ReviewState['reviewers']
): ConsensusStatus {
  let approved = 0
  let disputed = 0
  let pending = 0
  let revised = 0

  for (const section of enrichedSections) {
    switch (section.effectiveStatus) {
      case 'approved': approved++; break
      case 'disputed': disputed++; break
      case 'revised': revised++; break
      case 'pending': pending++; break
    }
  }

  const totalSections = enrichedSections.length

  const ready = enrichedSections.every(section => {
    if (section.effectiveStatus !== 'approved') return false
    const relevantReviewers = reviewers.filter(r => {
      const modelKey = SECTION_TYPE_TO_MODEL_KEY[section.targetType]
      return r.focus.includes(modelKey as string)
    })
    return relevantReviewers.every(r =>
      section.reviews.some(rev => rev.reviewerId === r.id && rev.status === 'approved')
    )
  })

  return { totalSections, approved, disputed, pending, revised, ready }
}

// --- Structural diff ---

export type DiffItem = {
  targetId: string
  targetType: SectionType
  change: 'added' | 'removed' | 'modified' | 'unchanged'
  current?: ModelItem
  previous?: ModelItem
}

export function computeStructuralDiff(
  current: IntentModel,
  previous: IntentModel
): DiffItem[] {
  const currentItems = getAllModelItems(current)
  const previousItems = getAllModelItems(previous)
  const diffs: DiffItem[] = []

  const previousMap = new Map(
    previousItems.map(({ item, type }) => [buildTargetId(type, item.id), { item, type }])
  )

  for (const { item, type } of currentItems) {
    const targetId = buildTargetId(type, item.id)
    const prev = previousMap.get(targetId)

    if (!prev) {
      diffs.push({ targetId, targetType: type, change: 'added', current: item })
    } else {
      const currentJson = JSON.stringify(item)
      const prevJson = JSON.stringify(prev.item)
      diffs.push({
        targetId,
        targetType: type,
        change: currentJson === prevJson ? 'unchanged' : 'modified',
        current: item,
        previous: prev.item,
      })
      previousMap.delete(targetId)
    }
  }

  for (const [targetId, { item, type }] of previousMap) {
    diffs.push({ targetId, targetType: type, change: 'removed', previous: item })
  }

  return diffs
}
