'use client'

import { useMemo, useState, useCallback } from 'react'
import { useThree, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { Actor } from '@/domain/intent-model/types'
import { TYPE_COLORS, CARD_OPACITY } from './constants'

type GlassPlatformProps = {
  actor: Actor
  position: [number, number, number]
  selected?: boolean
  faded?: boolean
  onClick?: (id: string) => void
}

const PLATFORM_WIDTH = 8
const PLATFORM_HEIGHT = 6
const TILT_ANGLE = -Math.PI / 12  // -15 degrees
const TEXTURE_SCALE = 2

function createPlatformTexture(actor: Actor): THREE.CanvasTexture {
  const w = PLATFORM_WIDTH * 40 * TEXTURE_SCALE
  const h = PLATFORM_HEIGHT * 40 * TEXTURE_SCALE
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = `rgba(255, 255, 255, 0.8)`
  ctx.beginPath()
  ctx.roundRect(0, 0, w, h, 16 * TEXTURE_SCALE)
  ctx.fill()

  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(0, 0, w, h, 16 * TEXTURE_SCALE)
  ctx.stroke()

  // Left edge strip
  ctx.fillStyle = TYPE_COLORS.actor
  ctx.fillRect(0, 16 * TEXTURE_SCALE, 8 * TEXTURE_SCALE, h - 32 * TEXTURE_SCALE)

  const pad = 20 * TEXTURE_SCALE

  // Actor name (large, top-left)
  ctx.fillStyle = '#34322D'
  ctx.font = `700 ${18 * TEXTURE_SCALE}px "DM Sans", sans-serif`
  ctx.fillText(actor.name, pad + 8 * TEXTURE_SCALE, pad + 18 * TEXTURE_SCALE)

  // Auth badge (top-right)
  ctx.fillStyle = '#858481'
  ctx.font = `500 ${10 * TEXTURE_SCALE}px "DM Sans", sans-serif`
  const authText = actor.auth.length > 25 ? actor.auth.slice(0, 25) + '...' : actor.auth
  const authWidth = ctx.measureText(authText).width
  ctx.fillText(authText, w - pad - authWidth, pad + 14 * TEXTURE_SCALE)

  // Responsibilities
  ctx.fillStyle = '#5E5E5B'
  ctx.font = `400 ${10 * TEXTURE_SCALE}px "DM Sans", sans-serif`
  const startY = pad + 38 * TEXTURE_SCALE
  const lineH = 14 * TEXTURE_SCALE
  const maxRows = Math.floor((h - startY - pad) / lineH)

  actor.responsibilities.slice(0, maxRows).forEach((r, i) => {
    const text = `${r.id.toUpperCase()} — ${r.description}`
    const maxW = w - pad * 2 - 8 * TEXTURE_SCALE
    let display = text
    while (ctx.measureText(display).width > maxW && display.length > 0) {
      display = display.slice(0, -1)
    }
    if (display.length < text.length) display += '...'
    ctx.fillText(display, pad + 8 * TEXTURE_SCALE, startY + i * lineH)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export function GlassPlatform({ actor, position, selected, faded, onClick }: GlassPlatformProps) {
  const [hovered, setHovered] = useState(false)
  const invalidate = useThree(s => s.invalidate)

  const texture = useMemo(() => createPlatformTexture(actor), [actor])

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    opacity: faded ? 0.4 : CARD_OPACITY,
    side: THREE.DoubleSide,
    roughness: 0.3,
    metalness: 0.05,
    emissive: new THREE.Color('#ffffff'),
    emissiveIntensity: 0.05,
  }), [texture, faded])

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onClick?.(actor.id)
    invalidate()
  }, [actor.id, onClick, invalidate])

  return (
    <group position={position}>
      <mesh
        rotation={[TILT_ANGLE, 0, 0]}
        material={material}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; invalidate() }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; invalidate() }}
      >
        <planeGeometry args={[PLATFORM_WIDTH, PLATFORM_HEIGHT]} />
      </mesh>

      {/* Selection glow */}
      {selected && (
        <mesh rotation={[TILT_ANGLE, 0, 0]}>
          <planeGeometry args={[PLATFORM_WIDTH + 0.3, PLATFORM_HEIGHT + 0.3]} />
          <meshBasicMaterial
            color={TYPE_COLORS.actor}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}
