import React from 'react';
import { Html, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSolarStore } from '../../store/useSolarStore.js';
import { interpolateEphemeris } from '../../services/horizonsEphemeris.js';
import OrbitRing from './OrbitRing.jsx';
import Moon from './Moon.jsx';
import Atmosphere from './Atmosphere.jsx';
import SaturnRings from './SaturnRings.jsx';

const orbitStyles = {
  mercury: { color: '#b8aaa0', tilt: -0.02 },
  venus: { color: '#ffd38a', tilt: 0.035 },
  earth: { color: '#68d8ff', tilt: -0.055 },
  mars: { color: '#ff936c', tilt: 0.075 },
  jupiter: { color: '#ffe0a8', tilt: -0.045 },
  saturn: { color: '#f4d68a', tilt: 0.105 },
  uranus: { color: '#a9fff5', tilt: -0.12 },
  neptune: { color: '#6fa4ff', tilt: 0.14 },
};
const moonsByPlanet = {
  earth: [
    { name: 'Mặt Trăng', radius: 0.22, distance: 2.05, orbitSpeed: 0.95, rotationSpeed: 0.7, angle: 1.2, tilt: 0.18 },
  ],
  mars: [
    { name: 'Phobos', radius: 0.13, distance: 1.75, orbitSpeed: 1.55, rotationSpeed: 1.2, angle: 0.4, color: '#b9a08b', tilt: 0.22 },
    { name: 'Deimos', radius: 0.09, distance: 2.25, orbitSpeed: 1.05, rotationSpeed: 0.9, angle: 2.4, color: '#a8937c', tilt: -0.14 },
  ],
  jupiter: [
    { name: 'Io', radius: 0.11, distance: 1.62, orbitSpeed: 1.25, rotationSpeed: 1.1, angle: 0.2, color: '#f1c15c', tilt: 0.05 },
    { name: 'Europa', radius: 0.1, distance: 1.98, orbitSpeed: 0.98, rotationSpeed: 0.8, angle: 1.5, color: '#dcd8cb', tilt: -0.08 },
    { name: 'Ganymede', radius: 0.15, distance: 2.38, orbitSpeed: 0.75, rotationSpeed: 0.65, angle: 2.8, color: '#a79782', tilt: 0.1 },
    { name: 'Callisto', radius: 0.14, distance: 2.82, orbitSpeed: 0.58, rotationSpeed: 0.52, angle: 4.1, color: '#746a5e', tilt: -0.12 },
  ],
  saturn: [
    { name: 'Titan', radius: 0.16, distance: 2.95, orbitSpeed: 0.62, rotationSpeed: 0.55, angle: 0.8, color: '#d8aa62', tilt: 0.24 },
    { name: 'Rhea', radius: 0.09, distance: 2.38, orbitSpeed: 0.85, rotationSpeed: 0.75, angle: 2.2, color: '#cfc8b8', tilt: -0.1 },
    { name: 'Enceladus', radius: 0.07, distance: 1.92, orbitSpeed: 1.08, rotationSpeed: 0.9, angle: 3.6, color: '#edf4ff', tilt: 0.16 },
  ],
  uranus: [
    { name: 'Titania', radius: 0.12, distance: 1.9, orbitSpeed: 0.7, rotationSpeed: 0.62, angle: 1.1, color: '#b7c0c5', tilt: 0.72 },
    { name: 'Oberon', radius: 0.1, distance: 2.28, orbitSpeed: 0.55, rotationSpeed: 0.5, angle: 3.2, color: '#9da5aa', tilt: 0.72 },
  ],
  neptune: [
    { name: 'Triton', radius: 0.13, distance: 2.05, orbitSpeed: -0.72, rotationSpeed: 0.6, angle: 2.1, color: '#d9d6c8', tilt: -0.48 },
  ],
};

function RealOrbitTrail({ samples, planet, orbitRadius, color, active, visible }) {
  const geometry = useMemo(() => {
    const orbitScale = orbitRadius / planet.nasa.semiMajorAxisAu;
    const points = samples.map(
      (sample) => new THREE.Vector3(sample.x * orbitScale, sample.z * orbitScale, sample.y * orbitScale)
    );

    if (points.length > 2) {
      points.push(points[0].clone());
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [orbitRadius, planet, samples]);

  if (!visible || !samples?.length) return null;

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={active ? 0.58 : 0.28}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </line>
  );
}

export default function Planet({ planet }) {
  const pivotRef = useRef();
  const orbitPositionRef = useRef();
  const visualRef = useRef();
  const meshRef = useRef();
  const cloudRef = useRef();
  const ringRef = useRef();
  const worldPosition = useMemo(() => new THREE.Vector3(), []);

  const selectedPlanetId = useSolarStore((state) => state.selectedPlanetId);
  const followingPlanetId = useSolarStore((state) => state.followingPlanetId);
  const mode = useSolarStore((state) => state.mode);
  const orbitMode = useSolarStore((state) => state.orbitMode);
  const timelineEpochMs = useSolarStore((state) => state.timelineEpochMs);
  const speed = useSolarStore((state) => state.speed);
  const showOrbits = useSolarStore((state) => state.showOrbits);
  const showLabels = useSolarStore((state) => state.showLabels);
  const selectPlanet = useSolarStore((state) => state.selectPlanet);
  const ephemeris = useSolarStore((state) => state.ephemeris);

  const texture = useTexture(planet.texture);
  const cloudTexture = useTexture(planet.clouds || planet.texture);
  const ringTexture = useTexture(planet.rings || planet.texture);
  const orbitRadius = mode === 'realistic' ? planet.realisticOrbit : planet.cinematicOrbit;
  const isSelected = selectedPlanetId === planet.id;
  const isFollowing = followingPlanetId === planet.id;
  const moons = moonsByPlanet[planet.id] || [];
  const orbitStyle = orbitStyles[planet.id] || orbitStyles.earth;
  const axialTiltRad = THREE.MathUtils.degToRad(planet.nasa.axialTiltDeg);
  const realSamples = ephemeris.status === 'ready' ? ephemeris.bodies[planet.id] : null;
  const showRealOrbit = mode === 'realistic' && orbitMode === 'real' && realSamples?.length;

  const initialAngle = useMemo(() => {
    const hash = [...planet.id].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
    return (hash % 360) * THREE.MathUtils.DEG2RAD;
  }, [planet.id]);

  useFrame((_, delta) => {
    if (!pivotRef.current || !orbitPositionRef.current || !meshRef.current || !visualRef.current) return;

    if (mode === 'realistic' && realSamples?.length) {
      const sample = interpolateEphemeris(realSamples, timelineEpochMs);
      const orbitScale = orbitRadius / planet.nasa.semiMajorAxisAu;

      pivotRef.current.rotation.y = 0;
      orbitPositionRef.current.position.set(
        sample.x * orbitScale,
        sample.z * orbitScale,
        sample.y * orbitScale
      );
    } else {
      pivotRef.current.rotation.y += delta * planet.orbitSpeed * speed * 0.16;
      orbitPositionRef.current.position.set(orbitRadius, 0, 0);
    }

    meshRef.current.rotation.y += delta * planet.rotationSpeed * speed;

    const nextScale = isFollowing ? 1.55 : 1;
    const smoothScale = THREE.MathUtils.lerp(visualRef.current.scale.x, nextScale, 0.075);
    visualRef.current.scale.setScalar(smoothScale);

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
      <OrbitRing
        radius={orbitRadius}
        visible={showOrbits && !showRealOrbit}
        color={orbitStyle.color}
        tilt={orbitStyle.tilt}
        speed={planet.orbitSpeed}
        active={isSelected || isFollowing}
      />
      <RealOrbitTrail
        samples={realSamples || []}
        planet={planet}
        orbitRadius={orbitRadius}
        color={orbitStyle.color}
        active={isSelected || isFollowing}
        visible={showOrbits && showRealOrbit}
      />
      <group ref={pivotRef} rotation-y={initialAngle}>
        <group ref={orbitPositionRef} position={[orbitRadius, 0, 0]}>
          <group ref={visualRef} rotation-z={axialTiltRad}>
            <mesh
              ref={meshRef}
              onClick={(event) => {
                event.stopPropagation();
                selectPlanet(planet.id);
              }}
            >
              <sphereGeometry args={[planet.radius, 96, 96]} />
              <meshStandardMaterial map={texture} roughness={0.76} metalness={0.015} emissive={isSelected ? '#1b2438' : '#000000'} emissiveIntensity={isSelected ? 0.12 : 0.02} />
            </mesh>

            <Atmosphere planetId={planet.id} radius={planet.radius} active={isSelected || isFollowing} />

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

            {planet.rings && planet.id === 'saturn' && (
              <SaturnRings
                radius={planet.radius}
                textureUrl={planet.rings}
                active={isSelected || isFollowing}
                speed={speed}
              />
            )}

            {planet.rings && planet.id !== 'saturn' && (
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
          </group>

          {moons.length > 0 && (
            <group scale={isFollowing ? 1.08 : 1}>
              {moons.map((moon) => (
                <Moon
                  key={moon.name}
                  moon={moon}
                  planetRadius={planet.radius}
                  showLabels={showLabels}
                  parentSelected={isSelected || isFollowing}
                  parentFollowing={isFollowing}
                />
              ))}
            </group>
          )}

          {showLabels && (
            <Html
              position={[0, planet.radius + (isFollowing ? 1.25 : 0.72), 0]}
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









