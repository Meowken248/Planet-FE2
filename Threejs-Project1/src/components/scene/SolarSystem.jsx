import React from 'react';
import { Environment, Preload, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { planets } from '../../data/planets.js';
import CameraRig from './CameraRig.jsx';
import Planet from './Planet.jsx';
import Spacecraft from './Spacecraft.jsx';
import Sun from './Sun.jsx';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function SolarSystem() {
  const stopFollowingPlanet = useSolarStore((state) => state.stopFollowingPlanet);

  return (
    <Canvas
      camera={{ fov: 38, near: 0.1, far: 500, position: [0, 10, 42] }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
      className="solar-canvas"
      onPointerMissed={stopFollowingPlanet}
    >
      <color attach="background" args={['#03040a']} />
      <fog attach="fog" args={['#03040a', 60, 180]} />

      <ambientLight intensity={0.45} />
      <Stars radius={135} depth={70} count={5500} factor={4} saturation={0.2} fade speed={0.35} />

      <Suspense fallback={null}>
        <group rotation-x={0.12} position={[0, -0.8, 0]}>
          <Sun />
          {planets.map((planet) => (
            <Planet key={planet.id} planet={planet} />
          ))}
          <Spacecraft />
        </group>
        <Environment preset="night" />
        <Preload all />
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}
