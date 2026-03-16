import { readFile, writeFile } from 'node:fs/promises'
import { kv } from '@vercel/kv'
import { REVIEW_STATE_PATH } from './paths'
import type { ReviewState } from '@/domain/intent-model/types'

const KV_KEY = 'review-state'

const isVercel = !!process.env.KV_REST_API_URL

export async function getReviewState(): Promise<ReviewState> {
  if (isVercel) {
    const cached = await kv.get<ReviewState>(KV_KEY)
    if (cached) return cached

    // Seed from bundled JSON on first access
    const raw = await readFile(REVIEW_STATE_PATH, 'utf-8')
    const state: ReviewState = JSON.parse(raw)
    await kv.set(KV_KEY, state)
    return state
  }

  const raw = await readFile(REVIEW_STATE_PATH, 'utf-8')
  return JSON.parse(raw)
}

export async function resetReviewState(): Promise<ReviewState> {
  const raw = await readFile(REVIEW_STATE_PATH, 'utf-8')
  const state: ReviewState = JSON.parse(raw)
  if (isVercel) {
    await kv.set(KV_KEY, state)
  }
  return state
}

export async function setReviewState(state: ReviewState): Promise<void> {
  if (isVercel) {
    await kv.set(KV_KEY, state)
    return
  }

  await writeFile(REVIEW_STATE_PATH, JSON.stringify(state, null, 2))
}
