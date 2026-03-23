'use client'

import { useRef, useState, useMemo, useCallback } from 'react'
import { Billboard } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createCardTexture } from './card-texture'
import { CARD_SIZES, TYPE_COLORS, ANIMATION, CARD_OPACITY, DEFERRED_OPACITY } from './constants'
import type { CardNode } from './types'

type GlassCardProps = {
  node: CardNode
  selected?: boolean
  faded?: boolean
  onClick?: (id: string) => void
  onDoubleClick?: (id: string) => void
  onHover?: (id: string | null) => void
}

export function GlassCard({ node, selected, faded, onClick, onDoubleClick, onHover }: GlassCardProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const invalidate = useThree(s => s.invalidate)

  const dim = CARD_SIZES[node.size]
  const color = TYPE_COLORS[node.type] || '#999'

  const texture = useMemo(
    () => createCardTexture({
      name: node.name,
      type: node.type,
      stat: node.stat,
      icon: node.icon || 'database',
      size: node.size,
      deferred: node.deferred,
    }),
    [node.name, node.type, node.stat, node.icon, node.size, node.deferred]
  )

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: node.deferred ? DEFERRED_OPACITY : CARD_OPACITY,
      side: THREE.DoubleSide,
      roughness: 0.3,
      metalness: 0.05,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.05,
    })
    return mat
  }, [texture, node.deferred])

  useFrame(() => {
    if (!meshRef.current) return
    const targetScale = hovered ? ANIMATION.hoverScale : 1.0
    const currentScale = meshRef.current.scale.x
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.15)
    if (Math.abs(newScale - currentScale) > 0.001) {
      meshRef.current.scale.setScalar(newScale)
      invalidate()
    }

    const targetOpacity = faded ? 0.4 : (node.deferred ? DEFERRED_OPACITY : CARD_OPACITY)
    if (Math.abs(material.opacity - targetOpacity) > 0.01) {
      material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.1)
      invalidate()
    }
  })

  const handlePointerOver = useCallback(() => {
    setHovered(true)
    onHover?.(node.id)
    document.body.style.cursor = 'pointer'
    invalidate()
  }, [node.id, onHover, invalidate])

  const handlePointerOut = useCallback(() => {
    setHovered(false)
    onHover?.(null)
    document.body.style.cursor = 'auto'
    invalidate()
  }, [onHover, invalidate])

  return (
    <Billboard position={node.position} follow lockX={false} lockY={false} lockZ={false}>
      <mesh
        ref={meshRef}
        material={material}
        onClick={(e) => { e.stopPropagation(); onClick?.(node.id) }}
        onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick?.(node.id) }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[dim.width, dim.height]} />
      </mesh>

      {selected && (
        <mesh>
          <planeGeometry args={[dim.width + 0.3, dim.height + 0.3]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </Billboard>
  )
}
