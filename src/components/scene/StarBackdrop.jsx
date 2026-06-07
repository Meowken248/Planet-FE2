import React from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function createStarField(count, radius, spread, seed = 1) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();

  for (let index = 0; index < count; index += 1) {
    const a = Math.sin((index + seed) * 12.9898) * 43758.5453;
    const b = Math.sin((index + seed * 2) * 78.233) * 24634.6345;
    const c = Math.sin((index + seed * 3) * 39.425) * 13513.1351;
    const u = a - Math.floor(a);
    const v = b - Math.floor(b);
    const w = c - Math.floor(c);
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const distance = radius + (w - 0.5) * spread;

    positions[index * 3] = Math.sin(phi) * Math.cos(theta) * distance;
    positions[index * 3 + 1] = Math.cos(phi) * distance;
    positions[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * distance;

    const warmth = (Math.sin(index * 5.17 + seed) + 1) * 0.5;
    color.set(warmth > 0.72 ? '#ffe2af' : warmth < 0.22 ? '#b7d8ff' : '#ffffff');
    const brightness = 0.58 + w * 0.42;
    colors[index * 3] = color.r * brightness;
    colors[index * 3 + 1] = color.g * brightness;
    colors[index * 3 + 2] = color.b * brightness;
  }

  return { positions, colors };
}

function StarLayer({ count, radius, spread, size, opacity, speed, seed }) {
  const pointsRef = useRef();
  const { camera } = useThree();
  const stars = useMemo(() => createStarField(count, radius, spread, seed), [count, radius, seed, spread]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * speed;
    pointsRef.current.rotation.x += delta * speed * 0.22;
    pointsRef.current.position.copy(camera.position).multiplyScalar(0.018);
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[stars.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[stars.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function NebulaVeil() {
  const groupRef = useRef();
  const nebulae = useMemo(
    () => [
      { position: [-64, 28, -112], scale: [44, 18, 1], color: '#5c7bff', opacity: 0.09, rotation: 0.45 },
      { position: [86, -18, -126], scale: [56, 22, 1], color: '#ff9b63', opacity: 0.075, rotation: -0.28 },
      { position: [12, 52, -145], scale: [70, 24, 1], color: '#8ff5ff', opacity: 0.052, rotation: 0.12 },
    ],
    []
  );

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.0018;
    }
  });

  return (
    <group ref={groupRef}>
      {nebulae.map((nebula, index) => (
        <mesh key={index} position={nebula.position} scale={nebula.scale} rotation-z={nebula.rotation}>
          <planeGeometry args={[1, 1, 1, 1]} />
          <meshBasicMaterial
            color={nebula.color}
            transparent
            opacity={nebula.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function StarBackdrop() {
  const meshRef = useRef();
  const texture = useTexture('/stars.jpg');

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.0035;
      meshRef.current.rotation.x += delta * 0.0008;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} scale={[-1, 1, 1]} frustumCulled={false}>
        <sphereGeometry args={[175, 96, 96]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} transparent opacity={0.52} depthWrite={false} />
      </mesh>

      <NebulaVeil />
      <StarLayer count={1300} radius={95} spread={28} size={0.035} opacity={0.42} speed={0.0016} seed={4} />
      <StarLayer count={1700} radius={138} spread={42} size={0.052} opacity={0.58} speed={0.0008} seed={9} />
      <StarLayer count={620} radius={72} spread={20} size={0.07} opacity={0.32} speed={0.0024} seed={15} />
    </group>
  );
}
