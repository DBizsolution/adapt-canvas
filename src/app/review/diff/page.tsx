import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { intentModel } from '@/domain/intent-model/model'
import { computeStructuralDiff } from '@/lib/review-utils'
import { DiffViewer } from '@/components/review/diff-viewer'
import { Card } from '@/components/ui/card'
import type { IntentModel } from '@/domain/intent-model/types'

export const dynamic = 'force-dynamic'

async function getPreviousModel(): Promise<IntentModel | null> {
  const historyDir = path.join(process.cwd(), 'src/domain/intent-model/history')
  try {
    const files = await readdir(historyDir)
    const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse()
    if (jsonFiles.length === 0) return null

    const latestSnapshot = path.join(historyDir, jsonFiles[0])
    const raw = await readFile(latestSnapshot, 'utf-8')
    return JSON.parse(raw) as IntentModel
  } catch {
    return null
  }
}

export default async function DiffPage() {
  const previous = await getPreviousModel()

  if (!previous) {
    return (
      <div className="pb-32">
        <h1 className="text-3xl font-bold mb-8">Version Diff</h1>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No previous version found. Create a snapshot in <code>src/domain/intent-model/history/</code> to enable diffing.
          </p>
        </Card>
      </div>
    )
  }

  const diffs = computeStructuralDiff(intentModel, previous)

  return (
    <div className="pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Version Diff</h1>
        <p className="text-base text-muted-foreground">
          Current v{intentModel.meta.version} vs. previous v{previous.meta.version}
        </p>
      </div>
      <DiffViewer diffs={diffs} />
    </div>
  )
}
