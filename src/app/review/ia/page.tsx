import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { getCurrentModel } from '@/lib/model-store'
import { IACanvas } from '@/components/ia/ia-canvas'
import { buildIAGraph } from '@/components/ia/ia-graph'
import { iaPositionsSchema } from '@/components/ia/ia-types'

export default async function IAPage() {
  const model = await getCurrentModel()

  const positionsRaw = await readFile(
    resolve(process.cwd(), 'src/components/ia/ia-positions.json'),
    'utf-8',
  )
  const positions = iaPositionsSchema.parse(JSON.parse(positionsRaw))

  const { nodes, edges, drift, stats } = buildIAGraph(model, positions)

  return (
    <div className="h-full w-full overflow-hidden">
      <IACanvas
        initialNodes={nodes}
        initialEdges={edges}
        drift={drift}
        stats={stats}
      />
    </div>
  )
}
