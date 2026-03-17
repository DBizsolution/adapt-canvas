import { getCurrentModel, getVersions, getVersion } from '@/lib/model-store'
import { computeStructuralDiff } from '@/lib/review-utils'
import { DiffViewer } from '@/components/review/diff-viewer'
import type { IntentModel } from '@/domain/intent-model/types'

export const dynamic = 'force-dynamic'

async function getPreviousModel(): Promise<IntentModel | null> {
  const versions = await getVersions()
  if (versions.length < 2) return null

  // Second-to-last version is the "previous"
  const previousMeta = versions[versions.length - 2]
  const previousVersion = await getVersion(previousMeta.id)
  return previousVersion?.model ?? null
}

export default async function DiffPage() {
  const intentModel = await getCurrentModel()
  const previous = await getPreviousModel()

  if (!previous) {
    return (
      <div className="pb-32">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Version Diff</h1>
        <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-white)', border: '1px solid var(--border-default)' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            No previous version to compare. Make an edit using the AI chat to see diffs here.
          </p>
        </div>
      </div>
    )
  }

  const diffs = computeStructuralDiff(intentModel, previous)

  return (
    <div className="pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Version Diff</h1>
        <p className="text-base" style={{ color: 'var(--text-muted)' }}>
          Current v{intentModel.meta.version} vs. previous v{previous.meta.version}
        </p>
      </div>
      <DiffViewer diffs={diffs} />
    </div>
  )
}
