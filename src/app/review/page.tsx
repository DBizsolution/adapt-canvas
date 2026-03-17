import { getReviewState } from '@/lib/review-store'
import { getCurrentModel } from '@/lib/model-store'
import { enrichSectionReviews, computeConsensus } from '@/lib/review-utils'
import { ConsensusDashboard } from '@/components/review/consensus-dashboard'

export const dynamic = 'force-dynamic'

export default async function ReviewDashboard() {
  const intentModel = await getCurrentModel()
  const reviewState = await getReviewState()

  const enrichedSections = await enrichSectionReviews(intentModel, reviewState)
  const consensus = computeConsensus(enrichedSections, reviewState.reviewers)

  return (
    <div className="pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--acfs-navy)' }}>
          {intentModel.meta.project}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          v{intentModel.meta.version} — {intentModel.meta.status}
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
