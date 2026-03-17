import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getVersion, addVersion, getLatestVersionId } from '@/lib/model-store'
import type { ModelVersion } from '@/lib/model-store'

const RevertRequestSchema = z.object({
  versionId: z.string(),
  author: z.string(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { versionId, author } = RevertRequestSchema.parse(body)

    const targetVersion = await getVersion(versionId)
    if (!targetVersion) {
      return NextResponse.json({ error: 'version_not_found' }, { status: 404 })
    }

    const parentId = await getLatestVersionId()

    const version: ModelVersion = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      author,
      prompt: `Reverted to version ${versionId}`,
      model: targetVersion.model,
      parentId,
    }

    await addVersion(version)

    return NextResponse.json({ version })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'revert_failed', message }, { status: 500 })
  }
}
