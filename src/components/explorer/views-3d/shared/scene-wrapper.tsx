'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, N8AO } from '@react-three/postprocessing'
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
        camera={{ position: [0, 5, 15], fov: 50, near: 0.1, far: 200 }}
        frameloop="demand"
      >
        <color attach="background" args={[CANVAS_BG]} />
        <fog attach="fog" args={[FOG_COLOR, 50, 120]} />

        {/* Lighting — stronger ambient for readability */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[-5, 8, 5]} intensity={0.6} castShadow={false} />
        <directionalLight position={[5, 4, -3]} intensity={0.3} castShadow={false} />

        {/* Subtle environment map for material definition */}
        <Environment preset="city" environmentIntensity={0.1} />

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
          <N8AO
            aoRadius={0.4}
            intensity={2}
            distanceFalloff={0.5}
            color={new Color('#000000')}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
