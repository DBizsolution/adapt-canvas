import { NextRequest, NextResponse } from 'next/server'
import { getReviewState, setReviewState } from '@/lib/review-store'
import { ReviewActionSchema } from '@/lib/review-schemas'
import { hashItem, getAllModelItems, buildTargetId } from '@/lib/review-utils'
import { getCurrentModel } from '@/lib/model-store'

export async function GET() {
  const reviewState = await getReviewState()
  return NextResponse.json(reviewState)
}

export async function POST(request: NextRequest) {
  const intentModel = await getCurrentModel()
  const body = await request.json()
  const parsed = ReviewActionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { targetId, reviewerId, action, comment } = parsed.data

  const reviewState = await getReviewState()

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

  await setReviewState(reviewState)

  return NextResponse.json({ success: true, section })
}
