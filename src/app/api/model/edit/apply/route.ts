import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getProposal, addVersion, getLatestVersionId } from '@/lib/model-store'
import type { ModelVersion } from '@/lib/model-store'
import { computeModelStatus } from '@/lib/model-validation'

const ApplyRequestSchema = z.object({
  proposalId: z.string(),
  author: z.string(),
  prompt: z.string(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { proposalId, author, prompt } = ApplyRequestSchema.parse(body)

    const proposal = await getProposal(proposalId)
    if (!proposal) {
      return NextResponse.json({ error: 'proposal_expired' }, { status: 410 })
    }

    const currentLatest = await getLatestVersionId()
    if (currentLatest !== proposal.latestVersionId) {
      return NextResponse.json({ error: 'version_conflict', currentVersionId: currentLatest }, { status: 409 })
    }

    // Recompute status before persisting
    const model = proposal.proposedModel
    model.meta.status = computeModelStatus(model)
    model.meta.lastUpdated = new Date().toISOString().split('T')[0]

    const version: ModelVersion = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      author,
      prompt,
      model,
      parentId: proposal.latestVersionId,
    }

    await addVersion(version)

    return NextResponse.json({ version })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'apply_failed', message }, { status: 500 })
  }
}
