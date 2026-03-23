'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { CONNECTION_DEFAULT_COLOR } from './constants'

type ConnectionLineProps = {
  from: [number, number, number]
  to: [number, number, number]
  color?: string
  visible?: boolean
  animated?: boolean
  thickness?: number
  opacity?: number
}

export function ConnectionLine({
  from,
  to,
  color = CONNECTION_DEFAULT_COLOR,
  visible = true,
  animated = false,
  thickness = 1,
  opacity = 0.6,
}: ConnectionLineProps) {
  const particlesRef = useRef<THREE.Points>(null)
  const invalidate = useThree(s => s.invalidate)
  const progressRef = useRef([0, 0.33, 0.66])

  const curve = useMemo(() => {
    const mid: [number, number, number] = [
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2 + 0.5,
      (from[2] + to[2]) / 2,
    ]
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...to),
    )
  }, [from, to])

  const linePoints = useMemo(() => curve.getPoints(32), [curve])

  useFrame(() => {
    if (!animated || !particlesRef.current || !visible) return
    const positions = particlesRef.current.geometry.attributes.position
    for (let i = 0; i < 3; i++) {
      progressRef.current[i] = (progressRef.current[i] + 0.008) % 1
      const pt = curve.getPoint(progressRef.current[i])
      positions.setXYZ(i, pt.x, pt.y, pt.z)
    }
    positions.needsUpdate = true
    invalidate()
  })

  const particleGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(9)
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return geo
  }, [])

  if (!visible) return null

  return (
    <group>
      <Line
        points={linePoints}
        color={color}
        lineWidth={thickness}
        transparent
        opacity={opacity}
      />
      {animated && (
        <points ref={particlesRef} geometry={particleGeometry}>
          <pointsMaterial color={color} size={0.15} transparent opacity={0.8} />
        </points>
      )}
    </group>
  )
}
