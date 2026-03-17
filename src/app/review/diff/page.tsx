import { getCurrentModel, getVersions, getVersion } from '@/lib/model-store'
import type { IntentModel } from '@/domain/intent-model/types'
import { SECTION_TYPE_TO_MODEL_KEY } from '@/domain/intent-model/types'
import type { SectionType } from '@/domain/intent-model/types'
import { SideBySideDiff } from '@/components/review/side-by-side-diff'

export const dynamic = 'force-dynamic'

async function getPreviousModel(): Promise<IntentModel | null> {
  const versions = await getVersions()
  if (versions.length < 2) return null

  const previousMeta = versions[versions.length - 2]
  const previousVersion = await getVersion(previousMeta.id)
  return previousVersion?.model ?? null
}

export default async function DiffPage() {
  const currentModel = await getCurrentModel()
  const previousModel = await getPreviousModel()

  if (!previousModel) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--acfs-navy)' }}>Version Diff</h1>
        <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-white)', border: '1px solid var(--border-default)' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            No previous version to compare. Make an edit using the AI chat to see diffs here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--acfs-navy)' }}>Version Diff</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          v{previousModel.meta.version} → v{currentModel.meta.version}
        </p>
      </div>

      <SideBySideDiff previous={previousModel} current={currentModel} />
    </div>
  )
}
