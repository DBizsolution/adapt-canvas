'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, SSAO } from '@react-three/postprocessing'
import { Color } from 'three'
import { CANVAS_BG, FOG_COLOR } from './constants'

type SceneWrapperProps = {
  children: React.ReactNode
  orbitEnabled?: boolean
  autoRotate?: boolean
}

export function SceneWrapper({ children, orbitEnabled = true, autoRotate = false }: SceneWrapperProps) {
  return (
    <div className="w-full h-full" style={{ background: CANVAS_BG }}>
      <Canvas
        gl={{ powerPreference: 'high-performance', alpha: false, antialias: true }}
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)}
        camera={{ position: [0, 8, 20], fov: 50, near: 0.1, far: 200 }}
        frameloop="demand"
      >
        <color attach="background" args={[CANVAS_BG]} />
        <fog attach="fog" args={[FOG_COLOR, 40, 100]} />

        {/* Lighting — soft ambient + upper-left directional */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[-5, 8, 5]} intensity={0.5} castShadow={false} />

        {/* Subtle environment map for glass reflections */}
        <Environment preset="city" environmentIntensity={0.15} />

        {children}

        <OrbitControls
          enabled={orbitEnabled}
          autoRotate={autoRotate}
          autoRotateSpeed={0.3}
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={80}
          makeDefault
        />

        <EffectComposer>
          <SSAO
            radius={0.4}
            intensity={15}
            luminanceInfluence={0.6}
            color={new Color('#000000')}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
