import React from 'react';
import { Html, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function Moon({ moon, planetRadius, showLabels, parentSelected, parentFollowing }) {
  const pivotRef = useRef();
  const meshRef = useRef();
  const orbitRef = useRef();
  const haloRef = useRef();
  const texture = useTexture(moon.texture || '/planets/mercury.jpg');
  const speed = useSolarStore((state) => state.speed);
  const initialAngle = useMemo(() => moon.angle ?? 0, [moon.angle]);
  const orbitRadius = planetRadius * moon.distance;
  const radius = planetRadius * moon.radius;

  useFrame((_, delta) => {
    if (pivotRef.current) {
      pivotRef.current.rotation.y += delta * moon.orbitSpeed * speed;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * moon.rotationSpeed * speed;
    }

    if (orbitRef.current) {
      const targetOpacity = parentFollowing ? 0.025 : parentSelected ? 0.075 : 0.045;
      orbitRef.current.material.opacity = THREE.MathUtils.lerp(
        orbitRef.current.material.opacity,
        targetOpacity,
        0.08
      );
    }

    if (haloRef.current) {
      haloRef.current.scale.setScalar(1 + Math.sin(performance.now() * 0.0025) * 0.08);
    }
  });

  return (
    <group rotation-z={moon.tilt || 0}>
      <mesh ref={orbitRef} rotation-x={Math.PI / 2}>
        <ringGeometry args={[orbitRadius - 0.003, orbitRadius + 0.003, 160]} />
        <meshBasicMaterial
          color={moon.orbitColor || '#9cc8ff'}
          transparent
          opacity={0.045}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <group ref={pivotRef} rotation-y={initialAngle}>
        <group position={[orbitRadius, 0, 0]}>
          <mesh ref={haloRef}>
            <sphereGeometry args={[radius * 1.5, 24, 24]} />
            <meshBasicMaterial
              color={moon.orbitColor || '#9cc8ff'}
              transparent
              opacity={parentSelected ? 0.1 : 0.045}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          <mesh ref={meshRef}>
            <sphereGeometry args={[radius, 48, 48]} />
            <meshStandardMaterial
              map={texture}
              color={moon.color || '#d8d2c4'}
              roughness={0.92}
              metalness={0.01}
            />
          </mesh>

          {showLabels && parentSelected && (
            <Html
              position={[0, radius + 0.18, 0]}
              center
              distanceFactor={8}
              className="planet-label moon-label"
            >
              <span>{moon.name}</span>
            </Html>
          )}
        </group>
      </group>
    </group>
  );
}
