import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSolarStore } from '../../store/useSolarStore.js';

function seededNoise(value) {
  return Math.sin(value * 12.9898) * 43758.5453 % 1;
}

function AsteroidRock({ config }) {
  const meshRef = useRef();
  const color = useMemo(() => new THREE.Color(config.color), [config.color]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * config.spin.x;
    meshRef.current.rotation.y += delta * config.spin.y;
    meshRef.current.rotation.z += delta * config.spin.z;
  });

  return (
    <mesh
      ref={meshRef}
      position={config.position}
      rotation={config.rotation}
      scale={config.scale}
    >
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        roughness={0.95}
        metalness={0.02}
        emissive={color}
        emissiveIntensity={0.035}
      />
    </mesh>
  );
}

export default function AsteroidBelt() {
  const beltRef = useRef();
  const hazeRef = useRef();
  const showOrbits = useSolarStore((state) => state.showOrbits);
  const speed = useSolarStore((state) => state.speed);

  const sprite = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(48, 48, 0, 48, 48, 48);
    gradient.addColorStop(0, 'rgba(255, 244, 214, 1)');
    gradient.addColorStop(0.35, 'rgba(207, 214, 221, 0.72)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 96, 96);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  const { positions, colors, rocks } = useMemo(() => {
    const count = 3400;
    const positionsArray = new Float32Array(count * 3);
    const colorsArray = new Float32Array(count * 3);
    const cool = new THREE.Color('#c7d7e6');
    const warm = new THREE.Color('#d8b57b');
    const ember = new THREE.Color('#ff9b55');
    const mixed = new THREE.Color();
    const inner = 11.55;
    const width = 2.05;

    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const lane = index % 3;
      const laneOffset = lane === 0 ? 0.12 : lane === 1 ? 0.72 : 1.42;
      const laneWidth = lane === 0 ? 0.28 : lane === 1 ? 0.42 : 0.34;
      const clump = Math.sin(angle * 9 + lane * 2.1) * 0.18 + Math.sin(angle * 23) * 0.055;
      const radius = inner + laneOffset + Math.random() * laneWidth + clump;
      const verticalSpread = lane === 1 ? 0.34 : 0.22;
      const height = (Math.random() - 0.5) * verticalSpread;

      positionsArray[index * 3] = Math.cos(angle) * radius;
      positionsArray[index * 3 + 1] = height;
      positionsArray[index * 3 + 2] = Math.sin(angle) * radius;

      mixed.copy(cool).lerp(warm, 0.25 + Math.random() * 0.55);
      if (Math.random() > 0.955) {
        mixed.lerp(ember, 0.45);
      }
      colorsArray[index * 3] = mixed.r;
      colorsArray[index * 3 + 1] = mixed.g;
      colorsArray[index * 3 + 2] = mixed.b;
    }

    const rockConfigs = Array.from({ length: 28 }, (_, index) => {
      const angle = (index / 28) * Math.PI * 2 + seededNoise(index + 1) * 0.42;
      const radius = inner + 0.2 + Math.abs(seededNoise(index + 7)) * width;
      const size = 0.035 + Math.abs(seededNoise(index + 11)) * 0.095;
      const height = (seededNoise(index + 17) - 0.5) * 0.38;
      return {
        position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
        rotation: [seededNoise(index + 21) * Math.PI, seededNoise(index + 31) * Math.PI, seededNoise(index + 41) * Math.PI],
        scale: [size * 1.25, size * (0.75 + Math.abs(seededNoise(index + 51)) * 0.8), size],
        color: index % 4 === 0 ? '#c7b08a' : index % 3 === 0 ? '#87919a' : '#b8a58e',
        spin: {
          x: 0.12 + Math.abs(seededNoise(index + 61)) * 0.28,
          y: 0.08 + Math.abs(seededNoise(index + 71)) * 0.24,
          z: 0.06 + Math.abs(seededNoise(index + 81)) * 0.2,
        },
      };
    });

    return { positions: positionsArray, colors: colorsArray, rocks: rockConfigs };
  }, []);

  useFrame((_, delta) => {
    if (beltRef.current) {
      beltRef.current.rotation.y += delta * 0.026 * speed;
      beltRef.current.rotation.z = 0.055 + Math.sin(performance.now() * 0.00008) * 0.018;
    }

    if (hazeRef.current) {
      hazeRef.current.rotation.y -= delta * 0.012 * speed;
    }
  });

  if (!showOrbits) {
    return null;
  }

  return (
    <group rotation-z={0.055}>
      <mesh ref={hazeRef} rotation-x={Math.PI / 2}>
        <ringGeometry args={[11.35, 13.85, 256]} />
        <meshBasicMaterial
          color="#d7c4a0"
          transparent
          opacity={0.045}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <points ref={beltRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={sprite}
          vertexColors
          size={0.095}
          sizeAttenuation
          transparent
          opacity={0.86}
          alphaTest={0.02}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <group>
        {rocks.map((rock) => (
          <AsteroidRock key={`${rock.position[0]}-${rock.position[2]}`} config={rock} />
        ))}
      </group>
    </group>
  );
}
