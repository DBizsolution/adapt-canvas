import { getCurrentModel } from '@/lib/model-store'
import { getExplorerPositions } from '@/lib/explorer-positions-store'
import { NavSidebar } from '@/components/review/nav-links'
import { ExplorerTabs } from '@/components/explorer/explorer-tabs'

export const dynamic = 'force-dynamic'

export default async function ExplorerPage() {
  const [model, savedPositions] = await Promise.all([
    getCurrentModel(),
    getExplorerPositions(),
  ])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-page)' }}>
      <NavSidebar />
      <div className="flex-1 overflow-hidden">
        <ExplorerTabs model={model} savedPositions={savedPositions} />
      </div>
    </div>
  )
}
