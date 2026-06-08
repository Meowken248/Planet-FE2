import React from 'react';
import { Environment, Preload, Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { planets } from '../../data/planets.js';
import { loadHorizonsEphemeris } from '../../services/horizonsEphemeris.js';
import AsteroidBelt from './AsteroidBelt.jsx';
import CameraRig from './CameraRig.jsx';
import Planet from './Planet.jsx';
import Spacecraft from './Spacecraft.jsx';
import SceneEffects from './SceneEffects.jsx';
import StarBackdrop from './StarBackdrop.jsx';
import Sun from './Sun.jsx';
import { useSolarStore } from '../../store/useSolarStore.js';

function SimulationClock() {
  const advanceTimeline = useSolarStore((state) => state.advanceTimeline);

  useFrame((_, delta) => {
    advanceTimeline(delta);
  });

  return null;
}

export default function SolarSystem() {
  const stopFollowingPlanet = useSolarStore((state) => state.stopFollowingPlanet);
  const mode = useSolarStore((state) => state.mode);
  const ephemerisStatus = useSolarStore((state) => state.ephemeris.status);

  useEffect(() => {
    if (mode !== 'realistic' || ephemerisStatus === 'ready' || ephemerisStatus === 'loading') return undefined;

    const controller = new AbortController();
    const store = useSolarStore.getState();
    store.setEphemerisLoading();

    loadHorizonsEphemeris({ signal: controller.signal })
      .then((ephemeris) => {
        useSolarStore.getState().setEphemerisData(ephemeris);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          useSolarStore.getState().setEphemerisError(error.message || 'Khong tai duoc Horizons');
        }
      });

    return () => controller.abort();
  }, [ephemerisStatus, mode]);

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

      <ambientLight intensity={0.22} />
      <hemisphereLight args={['#7fb8ff', '#08030d', 0.18]} />
      <StarBackdrop />
      <Stars radius={145} depth={80} count={1800} factor={2.7} saturation={0.12} fade speed={0.18} />

      <Suspense fallback={null}>
        <group rotation-x={0.12} position={[0, -0.8, 0]}>
          <Sun />
          <AsteroidBelt />
          {planets.map((planet) => (
            <Planet key={planet.id} planet={planet} />
          ))}
        </group>
        <Spacecraft />
        <Environment preset="night" />
        <Preload all />
      </Suspense>

      <SimulationClock />
      <SceneEffects />
      <CameraRig />
    </Canvas>
  );
}








