import React from 'react';
import { useMemo } from 'react';
import * as THREE from 'three';

const atmosphereColors = {
  mercury: '#d7c4ae',
  venus: '#ffc46f',
  earth: '#64d8ff',
  mars: '#ff8b63',
  jupiter: '#ffd79a',
  saturn: '#f3d58a',
  uranus: '#9ff8f2',
  neptune: '#5f93ff',
};

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uActive;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float rim = 1.0 - abs(dot(normalize(vNormal), viewDirection));
    float glow = pow(rim, 2.45) * uIntensity;
    glow += pow(rim, 7.0) * (0.55 + uActive * 0.45);
    gl_FragColor = vec4(uColor, glow);
  }
`;

export default function Atmosphere({ planetId, radius, active }) {
  const color = atmosphereColors[planetId] || '#8fdcff';
  const scale = active ? 1.135 : 1.085;

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uIntensity: { value: active ? 0.72 : 0.38 },
          uActive: { value: active ? 1 : 0 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [active, color]
  );

  return (
    <mesh scale={scale} renderOrder={-1} material={material}>
      <sphereGeometry args={[radius, 96, 96]} />
    </mesh>
  );
}
