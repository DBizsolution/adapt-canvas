import { readFile } from 'node:fs/promises'
import { notFound } from 'next/navigation'
import { REVIEW_STATE_PATH } from '@/lib/paths'
import { intentModel } from '@/domain/intent-model/model'
import { enrichSectionReviews, buildTargetId } from '@/lib/review-utils'
import { SectionPageClient } from '@/components/review/section-page-client'
import type { ReviewState, SectionType } from '@/domain/intent-model/types'
import { URL_PARAM_TO_SECTION_TYPE, SECTION_TYPE_TO_MODEL_KEY } from '@/domain/intent-model/types'

export const dynamic = 'force-dynamic'

const sectionLabels: Record<SectionType, string> = {
  actor: 'Actors',
  entity: 'Entities',
  journey: 'Journeys',
  business_rule: 'Business Rules',
  constraint: 'Constraints',
  open_question: 'Open Questions',
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  const sectionType = URL_PARAM_TO_SECTION_TYPE[section]
  if (!sectionType) notFound()

  const raw = await readFile(REVIEW_STATE_PATH, 'utf-8')
  const reviewState: ReviewState = JSON.parse(raw)
  const enrichedSections = await enrichSectionReviews(intentModel, reviewState)

  const modelKey = SECTION_TYPE_TO_MODEL_KEY[sectionType] as keyof typeof intentModel
  const modelItems = intentModel[modelKey] as Array<{ id: string; [key: string]: unknown }>

  const items = modelItems.map(item => {
    const targetId = buildTargetId(sectionType, item.id)
    const review = enrichedSections.find(s => s.targetId === targetId)!
    return { item, type: sectionType, review }
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{sectionLabels[sectionType]}</h1>
        <p className="text-muted-foreground">
          {items.length} items — {items.filter(i => i.review.effectiveStatus === 'approved').length} approved
        </p>
      </div>
      <SectionPageClient items={items} />
    </div>
  )
}
