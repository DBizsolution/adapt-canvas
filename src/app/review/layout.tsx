import { getReviewState } from '@/lib/review-store'
import { getCurrentModel, getLatestVersionId } from '@/lib/model-store'
import { ReviewerSelector } from '@/components/review/reviewer-selector'
import { NavLinks } from '@/components/review/nav-links'
import { IdentityModal } from '@/components/review/identity-modal'
import { PromptDrawer } from '@/components/ai/prompt-drawer'

export default async function ReviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const reviewState = await getReviewState()
  const model = await getCurrentModel()
  const latestVersionId = await getLatestVersionId()

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <IdentityModal />
      <header className="sticky top-0 z-10" style={{ backgroundColor: '#002C61' }}>
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-4">
          <h1 className="text-base font-bold text-white shrink-0">VBS Intent Model</h1>
          <NavLinks />
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-white/60">Reviewer</span>
            <ReviewerSelector reviewers={reviewState.reviewers} />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 bg-[#F5F6FA] min-h-screen">
        {children}
      </main>
      <PromptDrawer model={model} latestVersionId={latestVersionId} />
    </div>
  )
}
