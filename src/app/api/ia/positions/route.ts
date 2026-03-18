import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const POSITIONS_PATH = resolve(process.cwd(), 'src/components/ia/ia-positions.json')

export async function POST(req: Request) {
  try {
    const { nodeId, x, y } = await req.json()

    if (!nodeId || typeof x !== 'number' || typeof y !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const raw = await readFile(POSITIONS_PATH, 'utf-8')
    const data = JSON.parse(raw)

    // Validate nodeId exists in _screens
    if (!data._screens?.[nodeId]) {
      return NextResponse.json({ error: `Screen "${nodeId}" not found` }, { status: 404 })
    }

    // Update position override
    data[nodeId] = { x: Math.round(x), y: Math.round(y) }

    await writeFile(POSITIONS_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8')

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[IA] Failed to save position:', err)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
