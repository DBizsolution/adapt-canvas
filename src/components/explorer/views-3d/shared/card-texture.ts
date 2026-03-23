import { CanvasTexture } from 'three'
import { TYPE_COLORS, CARD_SIZES } from './constants'
import type { CardSize, ItemType } from './types'

const TEXTURE_SCALE = 2
const FONT = '500 {{size}}px "DM Sans", sans-serif'
const EDGE_STRIP_WIDTH = 8

const ICON_SVGS: Record<string, string> = {
  database: '<path d="M4 6c0-1.1 3.6-2 8-2s8 .9 8 2v12c0 1.1-3.6 2-8 2s-8-.9-8-2V6z"/><ellipse cx="12" cy="6" rx="8" ry="2"/><path d="M4 6v6c0 1.1 3.6 2 8 2s8-.9 8-2V6"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  'shield-alert': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  'circle-help': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
}

type CardTextureOptions = {
  name: string
  type: ItemType
  stat: string
  icon: string
  size: CardSize
  deferred?: boolean
}

export function createCardTexture(opts: CardTextureOptions): CanvasTexture {
  const dim = CARD_SIZES[opts.size]
  const w = dim.width * 40 * TEXTURE_SCALE
  const h = dim.height * 40 * TEXTURE_SCALE
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  const opacity = opts.deferred ? 0.5 : 0.8
  const color = TYPE_COLORS[opts.type] || '#999'

  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
  roundRect(ctx, 0, 0, w, h, 16 * TEXTURE_SCALE)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 2
  roundRect(ctx, 0, 0, w, h, 16 * TEXTURE_SCALE)
  ctx.stroke()

  ctx.fillStyle = color
  if (opts.deferred) {
    const stripW = EDGE_STRIP_WIDTH
    const dashH = 12 * TEXTURE_SCALE
    const gapH = 6 * TEXTURE_SCALE
    for (let y = 16 * TEXTURE_SCALE; y < h - 16 * TEXTURE_SCALE; y += dashH + gapH) {
      const segH = Math.min(dashH, h - 16 * TEXTURE_SCALE - y)
      ctx.fillRect(0, y, stripW, segH)
    }
  } else {
    roundRectLeft(ctx, 0, 0, EDGE_STRIP_WIDTH, h, 16 * TEXTURE_SCALE)
    ctx.fill()
  }

  const iconSize = opts.size === 'small' ? 18 : 24
  const iconX = EDGE_STRIP_WIDTH + 12 * TEXTURE_SCALE
  const iconY = 14 * TEXTURE_SCALE
  drawIcon(ctx, opts.icon, iconX, iconY, iconSize * TEXTURE_SCALE, color)

  const nameSize = opts.size === 'small' ? 12 : 14
  ctx.fillStyle = '#34322D'
  ctx.font = FONT.replace('{{size}}', String(nameSize * TEXTURE_SCALE))
  const nameX = iconX + iconSize * TEXTURE_SCALE + 8 * TEXTURE_SCALE
  const nameY = iconY + iconSize * TEXTURE_SCALE * 0.75
  const maxNameW = w - nameX - 12 * TEXTURE_SCALE
  ctx.fillText(truncate(opts.name, ctx, maxNameW), nameX, nameY)

  if (opts.stat) {
    const statSize = opts.size === 'small' ? 10 : 11
    ctx.fillStyle = '#858481'
    ctx.font = FONT.replace('{{size}}', String(statSize * TEXTURE_SCALE))
    const statY = nameY + (nameSize + 6) * TEXTURE_SCALE
    ctx.fillText(truncate(opts.stat, ctx, maxNameW), nameX, statY)
  }

  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function roundRectLeft(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w, y)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

const iconBitmapCache = new Map<string, ImageBitmap>()
let iconsReady = false

export async function preloadIcons(): Promise<void> {
  if (iconsReady) return
  const entries = Object.entries(ICON_SVGS)
  await Promise.all(
    entries.map(async ([key, paths]) => {
      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
      const blob = new Blob([svgStr], { type: 'image/svg+xml' })
      const bitmap = await createImageBitmap(blob)
      iconBitmapCache.set(key, bitmap)
    }),
  )
  iconsReady = true
}

function drawIcon(
  ctx: CanvasRenderingContext2D,
  icon: string,
  x: number,
  y: number,
  size: number,
  _color: string,
) {
  const bitmap = iconBitmapCache.get(icon)
  if (!bitmap) return
  ctx.drawImage(bitmap, x, y, size, size)
}

function truncate(text: string, ctx: CanvasRenderingContext2D, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 0 && ctx.measureText(t + '...').width > maxWidth) t = t.slice(0, -1)
  return t + '...'
}
