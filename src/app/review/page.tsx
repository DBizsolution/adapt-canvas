import { readFile } from 'node:fs/promises'
import { REVIEW_STATE_PATH } from '@/lib/paths'
import { intentModel } from '@/domain/intent-model/model'
import { enrichSectionReviews, computeConsensus } from '@/lib/review-utils'
import { ConsensusDashboard } from '@/components/review/consensus-dashboard'
import type { ReviewState } from '@/domain/intent-model/types'

export const dynamic = 'force-dynamic'

const reviewProcess = [
  {
    heading: 'Review',
    steps: [
      'Select your name from the Reviewer dropdown',
      'Navigate to a section — Actors, Entities, Journeys, Rules, Constraints, or Open Questions',
      'Read each item and either Approve or Dispute it with a comment',
      'Track consensus progress on this dashboard until all sections are approved',
    ],
  },
  {
    heading: 'When disputes arise',
    steps: [
      'Disputed items are flagged for the model author to revise',
      'The author updates the intent model (model.ts) via Claude Code',
      'Changed items automatically reset to "Revised" — reviewers re-review only what changed',
    ],
  },
  {
    heading: 'When consensus is reached',
    steps: [
      'All sections approved by all assigned reviewers → "Ready for Phase 3"',
      'Run pnpm intent:snapshot to save the approved version',
      'The approved intent model feeds directly into the next phases:',
    ],
  },
]

const pipeline = [
  { phase: 'Phase 3', label: 'State Machines', desc: 'Extract lifecycle transitions into formal state machines' },
  { phase: 'Phase 4', label: 'Domain Types', desc: 'Generate TypeScript types, Zod schemas, and status utilities' },
  { phase: 'Phase 5', label: 'Info Architecture', desc: 'Derive routes, screens, and navigation from actors and journeys' },
  { phase: 'Phase 6–9', label: 'Design → Code → Validate', desc: 'Wireframes, design system, code generation, and final validation' },
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
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">How this works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {reviewProcess.map(({ heading, steps }) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-[#002C61] mb-3">{heading}</h3>
              <ol className="space-y-2">
                {steps.map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#002C61] text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-xs text-gray-600 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* Pipeline */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">What the approved model feeds into</h3>
          <div className="flex flex-wrap gap-2">
            {pipeline.map(({ phase, label, desc }) => (
              <div key={phase} className="flex items-center gap-2 bg-[#F5F6FA] rounded-lg px-3 py-2 text-xs" title={desc}>
                <span className="font-semibold text-[#002C61]">{phase}</span>
                <span className="text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow in practice */}
        <div className="border-t border-gray-100 pt-5 mt-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">The workflow in practice</h3>
          <div className="bg-[#F8FAFC] rounded-lg p-4 font-mono text-[13px] leading-[1.8] text-[#334155]">
            <div className="flex gap-3">
              <span className="text-[#94A3B8] select-none shrink-0">1.</span>
              <div>
                <code className="text-[#002C61] font-semibold">pnpm intent:snapshot</code>
                <span className="text-[#94A3B8] ml-4"># save the approved v0.1.0</span>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-[#94A3B8] select-none shrink-0">2.</span>
              <div>
                <span>Bump version in <code className="text-[#002C61] font-semibold">model.ts</code></span>
                <span className="text-[#94A3B8] ml-4"># → v0.2.0</span>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-[#94A3B8] select-none shrink-0">3.</span>
              <span>Open Claude Code in the same repo</span>
            </div>
            <div className="flex gap-3 mt-2">
              <span className="text-[#94A3B8] select-none shrink-0">4.</span>
              <div>
                <span className="text-[#0D9488] font-semibold">{'"Extract state machines from the approved intent model"'}</span>
                <div className="ml-4 mt-1 text-[#64748B] text-xs font-sans space-y-0.5">
                  <p>→ AI reads model.ts entities + journeys</p>
                  <p>→ Generates state machine definitions</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <span className="text-[#94A3B8] select-none shrink-0">5.</span>
              <span>Continue through Phase 4, 5, etc. — each phase reads the same model</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3">The intent model is the single source of truth. Every downstream artifact is derived from it, never the other way around.</p>
        </div>
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
