import { getReviewState } from '@/lib/review-store'
import { getCurrentModel, getLatestVersionId } from '@/lib/model-store'
import { ReviewerSelector } from '@/components/review/reviewer-selector'
import { NavSidebar } from '@/components/review/nav-links'
import { IdentityModal } from '@/components/review/identity-modal'
import { ChatPanel } from '@/components/ai/prompt-drawer'

export default async function ReviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const reviewState = await getReviewState()
  const model = await getCurrentModel()
  const latestVersionId = await getLatestVersionId()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-page)' }}>
      <IdentityModal />

      {/* Left Nav Sidebar */}
      <NavSidebar />

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Model Panel — Left 60% */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Model toolbar */}
          <div className="flex h-[54px] shrink-0 items-center justify-between px-3 pl-4">
            <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              Intent Model
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Reviewer</span>
              <ReviewerSelector reviewers={reviewState.reviewers} />
            </div>
          </div>

          {/* Model content card */}
          <div
            className="ml-1 flex-1 overflow-y-auto rounded-xl custom-scroll"
            style={{
              background: 'var(--bg-card-gray)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div className="mx-auto max-w-5xl px-6 py-6">
              {children}
            </div>
          </div>

          {/* Bottom spacer */}
          <div className="h-3 shrink-0" />
        </div>

        {/* Chat Panel — Right 40% */}
        <ChatPanel model={model} latestVersionId={latestVersionId} />
      </div>
    </div>
  )
}
