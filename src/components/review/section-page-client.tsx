'use client'

import { useReviewerStore } from '@/stores/reviewer-store'
import { SectionCard } from './section-renderer'
import type { EnrichedSectionReview } from '@/lib/review-utils'
import type { SectionType } from '@/domain/intent-model/types'

type ModelItem = { id: string; [key: string]: unknown }

type SectionPageClientProps = {
  items: Array<{
    item: ModelItem
    type: SectionType
    review: EnrichedSectionReview
  }>
}

export function SectionPageClient({ items }: SectionPageClientProps) {
  const { currentReviewerId } = useReviewerStore()

  return (
    <div className="space-y-4">
      {items.map(({ item, type, review }) => (
        <SectionCard
          key={review.targetId}
          item={item as any}
          type={type}
          review={review}
          currentReviewerId={currentReviewerId}
        />
      ))}
    </div>
  )
}
