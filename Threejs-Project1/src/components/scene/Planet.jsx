import React from 'react';
import { Html, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSolarStore } from '../../store/useSolarStore.js';
import OrbitRing from './OrbitRing.jsx';

export default function Planet({ planet }) {
  const pivotRef = useRef();
  const meshRef = useRef();
  const cloudRef = useRef();
  const ringRef = useRef();
  const worldPosition = useMemo(() => new THREE.Vector3(), []);

  const selectedPlanetId = useSolarStore((state) => state.selectedPlanetId);
  const mode = useSolarStore((state) => state.mode);
  const speed = useSolarStore((state) => state.speed);
  const showOrbits = useSolarStore((state) => state.showOrbits);
  const showLabels = useSolarStore((state) => state.showLabels);
  const selectPlanet = useSolarStore((state) => state.selectPlanet);

  const texture = useTexture(planet.texture);
  const cloudTexture = useTexture(planet.clouds || planet.texture);
  const ringTexture = useTexture(planet.rings || planet.texture);
  const orbitRadius = mode === 'realistic' ? planet.realisticOrbit : planet.cinematicOrbit;
  const isSelected = selectedPlanetId === planet.id;

  const initialAngle = useMemo(() => {
    const hash = [...planet.id].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
    return (hash % 360) * THREE.MathUtils.DEG2RAD;
  }, [planet.id]);

  useFrame((_, delta) => {
    if (!pivotRef.current || !meshRef.current) return;
    pivotRef.current.rotation.y += delta * planet.orbitSpeed * speed * 0.16;
    meshRef.current.rotation.y += delta * planet.rotationSpeed * speed;

    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.2 * speed;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.04 * speed;
    }

    meshRef.current.getWorldPosition(worldPosition);
    useSolarStore.getState().setPlanetPosition(planet.id, worldPosition.toArray());

    if (isSelected) {
      useSolarStore.getState().setFocusTarget(worldPosition.toArray());
    }
  });

  return (
    <>
      <OrbitRing radius={orbitRadius} visible={showOrbits} />
      <group ref={pivotRef} rotation-y={initialAngle}>
        <group position={[orbitRadius, 0, 0]}>
          <mesh
            ref={meshRef}
            onClick={(event) => {
              event.stopPropagation();
              selectPlanet(planet.id);
            }}
          >
            <sphereGeometry args={[planet.radius, 96, 96]} />
            <meshStandardMaterial map={texture} roughness={0.82} metalness={0.02} />
          </mesh>

          {planet.clouds && (
            <mesh ref={cloudRef}>
              <sphereGeometry args={[planet.radius * 1.018, 96, 96]} />
              <meshStandardMaterial
                map={cloudTexture}
                transparent
                opacity={0.5}
                depthWrite={false}
                blending={THREE.NormalBlending}
              />
            </mesh>
          )}

          {planet.rings && (
            <mesh ref={ringRef} rotation-x={Math.PI / 2.45}>
              <ringGeometry args={[planet.radius * 1.35, planet.radius * 2.22, 192]} />
              <meshBasicMaterial
                map={ringTexture}
                alphaMap={ringTexture}
                transparent
                opacity={0.86}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          )}

          {showLabels && (
            <Html
              position={[0, planet.radius + 0.72, 0]}
              center
              distanceFactor={10}
              className={`planet-label ${isSelected ? 'is-selected' : ''}`}
            >
              <button type="button" onClick={() => selectPlanet(planet.id)}>
                {planet.name}
              </button>
            </Html>
          )}
        </group>
      </group>
    </>
  );
}
