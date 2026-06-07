import React from 'react';
import { Environment, Preload, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { planets } from '../../data/planets.js';
import AsteroidBelt from './AsteroidBelt.jsx';
import CameraRig from './CameraRig.jsx';
import Planet from './Planet.jsx';
import Spacecraft from './Spacecraft.jsx';
import SceneEffects from './SceneEffects.jsx';
import StarBackdrop from './StarBackdrop.jsx';
import Sun from './Sun.jsx';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function SolarSystem() {
  const stopFollowingPlanet = useSolarStore((state) => state.stopFollowingPlanet);
  const showOrbits = useSolarStore((state) => state.showOrbits);

  return (
    <Canvas
      camera={{ fov: 38, near: 0.1, far: 500, position: [0, 10, 42] }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      className="solar-canvas"
      onPointerMissed={stopFollowingPlanet}
    >
      <color attach="background" args={['#03040a']} />
      <fog attach="fog" args={['#03040a', 60, 180]} />

      <ambientLight intensity={0.45} />
      <StarBackdrop />
      <Stars radius={145} depth={80} count={1800} factor={2.7} saturation={0.12} fade speed={0.18} />

      <Suspense fallback={null}>
        <group rotation-x={0.12} position={[0, -0.8, 0]}>
          <Sun />
          {showOrbits && <AsteroidBelt />}
          {planets.map((planet) => (
            <Planet key={planet.id} planet={planet} />
          ))}
        </group>
        <Spacecraft />
        <Environment preset="night" />
        <Preload all />
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}








