import { readFile } from 'node:fs/promises'
import { REVIEW_STATE_PATH } from '@/lib/paths'
import { intentModel } from '@/domain/intent-model/model'
import { enrichSectionReviews, computeConsensus } from '@/lib/review-utils'
import { ConsensusDashboard } from '@/components/review/consensus-dashboard'
import type { ReviewState } from '@/domain/intent-model/types'

export const dynamic = 'force-dynamic'

const howItWorksSteps = [
  { step: 1, text: 'Select your name from the Reviewer dropdown in the top navbar' },
  { step: 2, text: 'Navigate to a section (Actors, Entities, Journeys, etc.) using the nav links' },
  { step: 3, text: 'Review each item — Approve or Dispute with an optional comment' },
  { step: 4, text: 'Track overall consensus progress on this dashboard' },
]

export default async function ReviewDashboard() {
  const raw = await readFile(REVIEW_STATE_PATH, 'utf-8')
  const reviewState: ReviewState = JSON.parse(raw)

  const enrichedSections = await enrichSectionReviews(intentModel, reviewState)
  const consensus = computeConsensus(enrichedSections, reviewState.reviewers)

  return (
    <div className="pb-32">
      {/* How it works */}
      <div className="mb-8 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">How it works</h2>
        <ol className="space-y-3">
          {howItWorksSteps.map(({ step, text }) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#002C61] text-white text-xs font-bold flex items-center justify-center">
                {step}
              </span>
              <span className="text-sm text-gray-600 pt-0.5">{text}</span>
            </li>
          ))}
        </ol>
      </div>

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
