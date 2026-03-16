import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'node:fs/promises'
import { REVIEW_STATE_PATH } from '@/lib/paths'
import { ReviewActionSchema } from '@/lib/review-schemas'
import { hashItem, getAllModelItems, buildTargetId } from '@/lib/review-utils'
import { intentModel } from '@/domain/intent-model/model'
import type { ReviewState, SectionReview } from '@/domain/intent-model/types'

export async function GET() {
  const raw = await readFile(REVIEW_STATE_PATH, 'utf-8')
  const reviewState: ReviewState = JSON.parse(raw)
  return NextResponse.json(reviewState)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = ReviewActionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { targetId, reviewerId, action, comment } = parsed.data

  const raw = await readFile(REVIEW_STATE_PATH, 'utf-8')
  const reviewState: ReviewState = JSON.parse(raw)

  const reviewer = reviewState.reviewers.find(r => r.id === reviewerId)
  if (!reviewer) {
    return NextResponse.json({ error: 'Reviewer not found' }, { status: 404 })
  }

  let section = reviewState.sections.find(s => s.targetId === targetId)

  if (!section) {
    const modelItems = getAllModelItems(intentModel)
    const [type, id] = targetId.split(':')
    const modelItem = modelItems.find(
      mi => mi.type === type && mi.item.id === id
    )

    if (!modelItem) {
      return NextResponse.json({ error: 'Model item not found' }, { status: 404 })
    }

    const contentHash = await hashItem(modelItem.item)
    section = {
      targetId,
      targetType: modelItem.type,
      status: 'pending',
      contentHash,
      reviews: [],
    }
    reviewState.sections.push(section)
  }

  // Update content hash to current model state
  const modelItems = getAllModelItems(intentModel)
  const matchingItem = modelItems.find(mi => buildTargetId(mi.type, mi.item.id) === targetId)
  if (matchingItem) {
    section.contentHash = await hashItem(matchingItem.item)
  }

  // Add review
  const reviewStatus = (action === 'approve' || action === 'resolve' || action === 'defer')
    ? 'approved'
    : 'disputed'
  section.reviews.push({
    reviewerId,
    status: reviewStatus,
    comment: action === 'resolve'
      ? `[RESOLVED] ${comment}`
      : action === 'defer'
        ? `[DEFERRED] ${comment}`
        : comment,
    timestamp: new Date().toISOString(),
  })

  // Update section status based on latest reviews
  const latestByReviewer = new Map<string, 'approved' | 'disputed'>()
  for (const review of section.reviews) {
    latestByReviewer.set(review.reviewerId, review.status)
  }
  const statuses = [...latestByReviewer.values()]
  if (statuses.some(s => s === 'disputed')) {
    section.status = 'disputed'
  } else if (statuses.length > 0 && statuses.every(s => s === 'approved')) {
    section.status = 'approved'
  } else {
    section.status = 'pending'
  }

  await writeFile(REVIEW_STATE_PATH, JSON.stringify(reviewState, null, 2))

  return NextResponse.json({ success: true, section })
}
