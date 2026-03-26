import { readFile } from 'fs/promises'
import { join } from 'path'
import { getCurrentModel } from '@/lib/model-store'
import { buildDataModelGraph } from '@/components/data-model/data-model-graph'
import { buildDatabaseSchemaGraph } from '@/components/data-model/database-schema-graph'
import { parseDbml } from '@/components/data-model/parse-dbml'
import { DataModelPageClient } from './page-client'

export default async function DataModelPage() {
  // Load intent model
  const intentModel = await getCurrentModel()
  const intentGraph = buildDataModelGraph(intentModel)

  // Load database schema
  const dbmlPath = join(process.cwd(), 'src/data/acfs-datamodel-corrected.dbml')
  const dbmlContent = await readFile(dbmlPath, 'utf-8')
  const dbmlSchema = parseDbml(dbmlContent)
  const schemaGraph = buildDatabaseSchemaGraph(dbmlSchema)

  return (
    <DataModelPageClient
      intentGraph={intentGraph}
      schemaGraph={schemaGraph}
      enums={dbmlSchema.enums}
      dbmlContent={dbmlContent}
    />
  )
}
