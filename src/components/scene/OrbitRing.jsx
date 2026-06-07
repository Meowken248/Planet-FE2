import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function OrbitRing({ radius, visible, color = '#8fd8ff', active = false, speed = 0.2, tilt = 0 }) {
  const groupRef = useRef();
  const beaconRef = useRef();
  const dustRef = useRef();
  const colorValue = useMemo(() => new THREE.Color(color), [color]);
  const dustPoints = useMemo(() => {
    const count = 84;
    const positions = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const jitter = Math.sin(index * 12.9898) * 0.018;
      positions[index * 3] = Math.cos(angle) * (radius + jitter);
      positions[index * 3 + 1] = 0;
      positions[index * 3 + 2] = Math.sin(angle) * (radius + jitter);
    }

    return positions;
  }, [radius]);

  const showOrbits = useSolarStore((state) => state.showOrbits);
  const timeScale = useSolarStore((state) => state.speed);

  useFrame((_, delta) => {
    if (!visible || !groupRef.current) return;

    groupRef.current.rotation.y += delta * speed * 0.018 * timeScale;

    if (beaconRef.current) {
      const angle = performance.now() * 0.00022 * (1 + speed * 2.2);
      beaconRef.current.position.set(Math.cos(angle) * radius, 0.018, Math.sin(angle) * radius);
      const pulse = active ? 1.25 + Math.sin(angle * 9) * 0.22 : 0.72 + Math.sin(angle * 7) * 0.1;
      beaconRef.current.scale.setScalar(pulse);
    }

    if (dustRef.current) {
      dustRef.current.rotation.y -= delta * speed * 0.035 * timeScale;
    }
  });

  if (!visible && !showOrbits) {
    return null;
  }

  return (
    <group ref={groupRef} rotation-z={tilt} visible={visible}>
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[radius - 0.007, radius + 0.007, 256]} />
        <meshBasicMaterial
          color={colorValue}
          transparent
          opacity={active ? 0.38 : 0.16}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[radius - 0.045, radius + 0.045, 256]} />
        <meshBasicMaterial
          color={colorValue}
          transparent
          opacity={active ? 0.16 : 0.055}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPoints, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={colorValue}
          size={active ? 0.045 : 0.026}
          transparent
          opacity={active ? 0.55 : 0.24}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <mesh ref={beaconRef} position={[radius, 0.018, 0]}>
        <sphereGeometry args={[active ? 0.075 : 0.045, 18, 18]} />
        <meshBasicMaterial
          color={colorValue}
          transparent
          opacity={active ? 0.92 : 0.46}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
