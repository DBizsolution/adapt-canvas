import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { kv } from '@vercel/kv'
import type { IAPositions } from '@/components/ia/ia-types'

const isVercel = !!process.env.KV_REST_API_URL
const KV_KEY = 'ia-positions'
const FILE_PATH = resolve(process.cwd(), 'src/components/ia/ia-positions.json')

export async function getIAPositions(): Promise<IAPositions> {
  // Try KV first (has latest drag overrides on Vercel)
  if (isVercel) {
    const kvData = await kv.get<IAPositions>(KV_KEY)
    if (kvData) return kvData
  }

  // Fall back to JSON file (local dev, or first deploy before any drags)
  const raw = await readFile(FILE_PATH, 'utf-8')
  return JSON.parse(raw) as IAPositions
}

export async function saveNodePosition(nodeId: string, x: number, y: number) {
  const positions = await getIAPositions()

  if (!positions._screens?.[nodeId]) {
    throw new Error(`Screen "${nodeId}" not found`)
  }

  positions[nodeId] = { x: Math.round(x), y: Math.round(y) }

  if (isVercel) {
    await kv.set(KV_KEY, positions)
  } else {
    await writeFile(FILE_PATH, JSON.stringify(positions, null, 2) + '\n', 'utf-8')
  }
}
