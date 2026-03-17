import { getReviewState } from '@/lib/review-store'
import { getCurrentModel, getLatestVersionId } from '@/lib/model-store'
import { ReviewerSelector } from '@/components/review/reviewer-selector'
import { NavSidebar } from '@/components/review/nav-links'
import { IdentityModal } from '@/components/review/identity-modal'
import { ChatPanel } from '@/components/ai/prompt-drawer'
import { PageLoading } from '@/components/review/page-loading'
import { ChatPanelWrapper, ModelToolbar, ContentWrapper, ContentCard } from '@/components/review/layout-shell'

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
      <PageLoading />
      <IdentityModal />

      {/* Left Nav Sidebar */}
      <NavSidebar />

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Model Panel */}
        <ContentWrapper>
          {/* Model toolbar — hidden on docs page */}
          <ModelToolbar>
            <div className="flex h-[54px] shrink-0 items-center justify-between px-3 pl-4">
              <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                Intent Model
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Reviewer</span>
                <ReviewerSelector reviewers={reviewState.reviewers} />
              </div>
            </div>
          </ModelToolbar>

          {/* Content card */}
          <ContentCard>
            {children}
          </ContentCard>

          {/* Bottom spacer */}
          <div className="h-3 shrink-0" />
        </ContentWrapper>

        {/* Chat Panel — hidden on docs page */}
        <ChatPanelWrapper>
          <ChatPanel model={model} latestVersionId={latestVersionId} />
        </ChatPanelWrapper>
      </div>
    </div>
  )
}
