import React from 'react';
import * as THREE from 'three';

export default function OrbitRing({ radius, visible }) {
  return (
    <mesh rotation-x={Math.PI / 2} visible={visible}>
      <ringGeometry args={[radius - 0.012, radius + 0.012, 192]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.16}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
