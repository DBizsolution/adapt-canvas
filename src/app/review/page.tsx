import { readFile } from 'node:fs/promises'
import { REVIEW_STATE_PATH } from '@/lib/paths'
import { intentModel } from '@/domain/intent-model/model'
import { enrichSectionReviews, computeConsensus } from '@/lib/review-utils'
import { ConsensusDashboard } from '@/components/review/consensus-dashboard'
import type { ReviewState } from '@/domain/intent-model/types'

export const dynamic = 'force-dynamic'

export default async function ReviewDashboard() {
  const raw = await readFile(REVIEW_STATE_PATH, 'utf-8')
  const reviewState: ReviewState = JSON.parse(raw)

  const enrichedSections = await enrichSectionReviews(intentModel, reviewState)
  const consensus = computeConsensus(enrichedSections, reviewState.reviewers)

  return (
    <div className="pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Review Dashboard</h1>
        <p className="text-base text-muted-foreground">
          {intentModel.meta.project} — v{intentModel.meta.version} — {intentModel.meta.status}
        </p>
      </div>
      <ConsensusDashboard
        consensus={consensus}
        sections={enrichedSections}
        reviewers={reviewState.reviewers}
      />
    </div>
  )
}
