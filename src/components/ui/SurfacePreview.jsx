import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function SurfaceGlobe({ planet }) {
  const groupRef = useRef();
  const cloudRef = useRef();
  const texture = useTexture(planet.texture);
  const cloudTexture = useTexture(planet.clouds || planet.texture);
  const ringTexture = useTexture(planet.rings || planet.texture);

  const isEarth = planet.id === 'earth';
  const isSaturn = planet.id === 'saturn';
  const isGasGiant = ['jupiter', 'saturn', 'uranus', 'neptune'].includes(planet.id);

  const materialProps = useMemo(
    () => ({
      roughness: isGasGiant ? 0.82 : 0.64,
      metalness: 0.015,
      emissive: new THREE.Color(isGasGiant ? '#141018' : '#05070d'),
      emissiveIntensity: isGasGiant ? 0.12 : 0.045,
    }),
    [isGasGiant]
  );

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.18;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.26;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.18, -0.35, 0]}>
      <mesh>
        <sphereGeometry args={[1.25, 96, 96]} />
        <meshStandardMaterial map={texture} {...materialProps} />
      </mesh>

      {isEarth && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[1.285, 96, 96]} />
          <meshStandardMaterial
            map={cloudTexture}
            transparent
            opacity={0.38}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      )}

      <mesh scale={1.04}>
        <sphereGeometry args={[1.25, 96, 96]} />
        <meshBasicMaterial
          color={isGasGiant ? '#ffd391' : '#7adfff'}
          transparent
          opacity={0.075}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {isSaturn && (
        <mesh rotation={[Math.PI / 2.38, 0, -0.24]}>
          <ringGeometry args={[1.55, 2.35, 192]} />
          <meshBasicMaterial
            map={ringTexture}
            alphaMap={ringTexture}
            transparent
            opacity={0.78}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

function PreviewFallback() {
  return (
    <div className="surface-preview-fallback">
      <span />
    </div>
  );
}

export default function SurfacePreview({ planet }) {
  return (
    <div className={`surface-preview ${planet.id}`}>
      <div className="surface-preview-header">
        <div>
          <span>Surface Preview</span>
          <strong>Bề mặt 3D</strong>
        </div>
        <i>{planet.name}</i>
      </div>

      <div className="surface-preview-stage">
        <Suspense fallback={<PreviewFallback />}>
          <Canvas
            camera={{ position: [0, 0.18, 4.2], fov: 35, near: 0.1, far: 20 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <ambientLight intensity={0.78} />
            <directionalLight position={[3.4, 2.6, 3.8]} intensity={2.05} color="#fff0d0" />
            <pointLight position={[-2.6, -1.1, 2.2]} intensity={0.75} color="#77dfff" />
            <SurfaceGlobe planet={planet} />
            <Environment preset="night" />
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              rotateSpeed={0.42}
              minPolarAngle={Math.PI * 0.28}
              maxPolarAngle={Math.PI * 0.72}
            />
          </Canvas>
        </Suspense>
      </div>

      <div className="surface-preview-readout">
        <span>Texture</span>
        <strong>{planet.texture.replace(/^\//, '')}</strong>
      </div>
    </div>
  );
}