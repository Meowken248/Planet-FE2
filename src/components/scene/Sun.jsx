import React from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function Sun() {
  const sunRef = useRef();
  const glowRef = useRef();
  const texture = useTexture('/planets/sun.jpg');

  useFrame((_, delta) => {
    if (sunRef.current) sunRef.current.rotation.y += delta * 0.18;
    if (glowRef.current) {
      glowRef.current.rotation.y -= delta * 0.05;
      glowRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.001) * 0.025);
    }
  });

  return (
    <group>
      <pointLight color="#fff5d5" intensity={450} distance={140} decay={1.6} />
      <mesh ref={sunRef}>
        <sphereGeometry args={[2.15, 96, 96]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.7, 64, 64]} />
        <meshBasicMaterial color="#ffb84d" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  );
}
