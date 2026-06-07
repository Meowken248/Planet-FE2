import React from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function createRingDust(count, innerRadius, outerRadius) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();

  for (let index = 0; index < count; index += 1) {
    const randomA = Math.sin(index * 12.9898) * 43758.5453;
    const randomB = Math.sin(index * 78.233) * 24634.6345;
    const randomC = Math.sin(index * 37.719) * 97531.1357;
    const u = randomA - Math.floor(randomA);
    const v = randomB - Math.floor(randomB);
    const w = randomC - Math.floor(randomC);
    const radius = innerRadius + u * (outerRadius - innerRadius);
    const angle = v * Math.PI * 2;
    const y = (w - 0.5) * 0.035;

    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = Math.sin(angle) * radius;

    color.set(w > 0.72 ? '#fff0c5' : w < 0.28 ? '#b9a27f' : '#d7c397');
    const brightness = 0.45 + w * 0.45;
    colors[index * 3] = color.r * brightness;
    colors[index * 3 + 1] = color.g * brightness;
    colors[index * 3 + 2] = color.b * brightness;
  }

  return { positions, colors };
}

export default function SaturnRings({ radius, textureUrl, active, speed }) {
  const groupRef = useRef();
  const dustRef = useRef();
  const texture = useTexture(textureUrl);
  const dust = useMemo(() => createRingDust(900, radius * 1.48, radius * 2.58), [radius]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.018 * speed;
    }
    if (dustRef.current) {
      dustRef.current.rotation.z -= delta * 0.012 * speed;
    }
  });

  const ringLayers = [
    { inner: 1.32, outer: 1.48, color: '#7d6c55', opacity: 0.16 },
    { inner: 1.5, outer: 1.86, color: '#f1d79a', opacity: 0.34 },
    { inner: 1.9, outer: 2.05, color: '#35291d', opacity: 0.18 },
    { inner: 2.08, outer: 2.35, color: '#d4bd8b', opacity: 0.28 },
    { inner: 2.4, outer: 2.72, color: '#9f8d6f', opacity: 0.16 },
  ];

  return (
    <group ref={groupRef} rotation-x={Math.PI / 2.45}>
      <mesh>
        <ringGeometry args={[radius * 1.34, radius * 2.74, 256]} />
        <meshBasicMaterial
          map={texture}
          alphaMap={texture}
          transparent
          opacity={active ? 0.94 : 0.82}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {ringLayers.map((layer, index) => (
        <mesh key={index} position={[0, 0, 0.002 + index * 0.001]}>
          <ringGeometry args={[radius * layer.inner, radius * layer.outer, 256]} />
          <meshBasicMaterial
            color={layer.color}
            transparent
            opacity={active ? layer.opacity * 1.25 : layer.opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      <points ref={dustRef} position={[0, 0, 0.01]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dust.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={active ? 0.018 : 0.012}
          transparent
          opacity={active ? 0.38 : 0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
