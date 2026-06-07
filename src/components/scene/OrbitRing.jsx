import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function OrbitRing({ radius, visible, color = '#8fd8ff', active = false, speed = 0.2, tilt = 0 }) {
  const groupRef = useRef();
  const colorValue = useMemo(() => new THREE.Color(color), [color]);
  const showOrbits = useSolarStore((state) => state.showOrbits);
  const timeScale = useSolarStore((state) => state.speed);

  useFrame((_, delta) => {
    if (!visible || !groupRef.current) return;
    groupRef.current.rotation.y += delta * speed * 0.012 * timeScale;
  });

  if (!visible && !showOrbits) {
    return null;
  }

  return (
    <group ref={groupRef} rotation-z={tilt} visible={visible}>
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[radius - 0.006, radius + 0.006, 256]} />
        <meshBasicMaterial
          color={colorValue}
          transparent
          opacity={active ? 0.34 : 0.13}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[radius - 0.036, radius + 0.036, 256]} />
        <meshBasicMaterial
          color={colorValue}
          transparent
          opacity={active ? 0.12 : 0.038}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
