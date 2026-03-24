'use client'

import { useRef, useState, useCallback } from 'react'
import { Billboard, Text, RoundedBox } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
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
  const groupRef = useRef<THREE.Group>(null)
  const cardMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)
  const [textHeight, setTextHeight] = useState(0)
  const [statHeight, setStatHeight] = useState(0)
  const invalidate = useThree(s => s.invalidate)

  const baseDim = CARD_SIZES[node.size]
  const color = TYPE_COLORS[node.type] || '#999'

  // Typography sizing based on card size
  const nameSize = node.size === 'small' ? 0.26 : node.size === 'medium' ? 0.30 : 0.36
  const statSize = node.size === 'small' ? 0.18 : node.size === 'medium' ? 0.20 : 0.22
  const statOffset = node.size === 'small' ? 0.35 : node.size === 'medium' ? 0.40 : 0.45
  const edgeWidth = 0.15
  const padding = 0.5

  // Dynamic height based on text content - ensure minimum height and add spacing
  const spacing = node.stat ? 0.15 : 0
  const contentHeight = textHeight + statHeight + spacing + padding * 2
  const dim = {
    width: baseDim.width,
    height: Math.max(contentHeight || baseDim.height, baseDim.height)
  }

  useFrame(() => {
    if (!groupRef.current || !cardMaterialRef.current) return

    const targetScale = selected ? 1.15 : (hovered ? ANIMATION.hoverScale : 1.0)
    const currentScale = groupRef.current.scale.x
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.15)
    if (Math.abs(newScale - currentScale) > 0.001) {
      groupRef.current.scale.setScalar(newScale)
      invalidate()
    }

    const targetOpacity = faded ? 0.3 : (node.deferred ? DEFERRED_OPACITY : CARD_OPACITY)
    if (Math.abs(cardMaterialRef.current.opacity - targetOpacity) > 0.01) {
      cardMaterialRef.current.opacity = THREE.MathUtils.lerp(cardMaterialRef.current.opacity, targetOpacity, 0.1)
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
      <group ref={groupRef}>
        {/* White card background — main body */}
        <RoundedBox
          args={[dim.width, dim.height, 0.02]}
          radius={0.15}
          smoothness={4}
          onClick={(e) => { e.stopPropagation(); onClick?.(node.id) }}
          onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick?.(node.id) }}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <meshStandardMaterial
            ref={cardMaterialRef}
            color="#ffffff"
            transparent
            opacity={node.deferred ? DEFERRED_OPACITY : CARD_OPACITY}
            side={THREE.DoubleSide}
            roughness={0.4}
            metalness={0.02}
          />
        </RoundedBox>

        {/* Subtle colored tint overlay */}
        <RoundedBox
          args={[dim.width, dim.height, 0.01]}
          radius={0.15}
          smoothness={4}
          position={[0, 0, 0.011]}
        >
          <meshBasicMaterial
            color={color}
            transparent
            opacity={node.deferred ? 0.06 : 0.08}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </RoundedBox>

        {/* Colored left edge strip */}
        <mesh position={[-dim.width / 2 + edgeWidth / 2, 0, 0.011]}>
          <planeGeometry args={[edgeWidth, dim.height - 0.3]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={node.deferred ? 0.6 : 1.0}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Card name — always opaque */}
        <Text
          position={[-dim.width / 2 + edgeWidth + 0.25, dim.height / 2 - padding, 0.016]}
          fontSize={nameSize}
          color="#0A0A0A"
          anchorX="left"
          anchorY="top"
          maxWidth={dim.width - edgeWidth - 0.5}
          font="/fonts/DMSans-Variable.ttf"
          fontWeight={600}
          overflowWrap="break-word"
          whiteSpace="normal"
          onSync={(troika) => {
            if (troika.textRenderInfo) {
              const bounds = troika.textRenderInfo.blockBounds
              if (bounds) {
                const height = Math.abs(bounds[3] - bounds[1])
                if (height !== textHeight) {
                  setTextHeight(height)
                  invalidate()
                }
              }
            }
          }}
        >
          {node.name}
        </Text>

        {/* Card stat — always opaque */}
        {node.stat && (
          <Text
            position={[-dim.width / 2 + edgeWidth + 0.25, dim.height / 2 - padding - textHeight - 0.15, 0.016]}
            fontSize={statSize}
            color="#525252"
            anchorX="left"
            anchorY="top"
            maxWidth={dim.width - edgeWidth - 0.5}
            font="/fonts/DMSans-Variable.ttf"
            fontWeight={400}
            overflowWrap="break-word"
            whiteSpace="normal"
            onSync={(troika) => {
              if (troika.textRenderInfo) {
                const bounds = troika.textRenderInfo.blockBounds
                if (bounds) {
                  const height = Math.abs(bounds[3] - bounds[1])
                  if (height !== statHeight) {
                    setStatHeight(height)
                    invalidate()
                  }
                }
              }
            }}
          >
            {node.stat}
          </Text>
        )}

        {/* Selection border */}
        {selected && (
          <RoundedBox
            args={[dim.width + 0.25, dim.height + 0.25, 0.02]}
            radius={0.15}
            smoothness={4}
            position={[0, 0, -0.01]}
          >
            <meshBasicMaterial
              color="#0081F2"
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </RoundedBox>
        )}
      </group>
    </Billboard>
  )
}
