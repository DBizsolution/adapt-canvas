import { getCurrentModel } from '@/lib/model-store'
import { DataModelCanvas } from '@/components/data-model/data-model-canvas'
import { buildDataModelGraph } from '@/components/data-model/data-model-graph'

export default async function DataModelPage() {
  const model = await getCurrentModel()
  const { nodes, edges, stats } = buildDataModelGraph(model)

  return (
    <div className="h-full w-full overflow-hidden">
      <DataModelCanvas
        initialNodes={nodes}
        initialEdges={edges}
        stats={stats}
      />
    </div>
  )
}
