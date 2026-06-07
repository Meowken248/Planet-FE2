import React from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const sunVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const sunFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  float wave(vec2 uv, float speed, float scale) {
    float a = sin((uv.x * scale + uTime * speed) * 6.2831);
    float b = sin((uv.y * scale * 0.72 - uTime * speed * 0.74) * 6.2831);
    float c = sin(((uv.x + uv.y) * scale * 0.55 + uTime * speed * 1.25) * 6.2831);
    return (a + b + c) / 3.0;
  }

  void main() {
    vec2 uv = vUv;
    vec3 tex = texture2D(uTexture, uv + vec2(sin(uTime * 0.05) * 0.006, 0.0)).rgb;
    float flame = wave(uv, 0.08, 7.0) * 0.5 + wave(uv.yx, 0.12, 13.0) * 0.32;
    float hot = smoothstep(-0.28, 0.78, flame);
    vec3 deepOrange = vec3(1.0, 0.24, 0.03);
    vec3 gold = vec3(1.0, 0.72, 0.16);
    vec3 whiteHot = vec3(1.0, 0.94, 0.58);
    vec3 color = mix(deepOrange, gold, hot);
    color = mix(color, whiteHot, pow(hot, 3.0) * 0.72);
    color *= tex * 1.35;
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(cameraPosition - vWorldPosition))), 2.2);
    color += vec3(1.0, 0.42, 0.08) * rim * 0.75;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function Sun() {
  const sunRef = useRef();
  const innerGlowRef = useRef();
  const outerGlowRef = useRef();
  const coronaRef = useRef();
  const texture = useTexture('/planets/sun.jpg');

  const sunMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: texture },
          uTime: { value: 0 },
        },
        vertexShader: sunVertexShader,
        fragmentShader: sunFragmentShader,
        toneMapped: false,
      }),
    [texture]
  );

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime;
    sunMaterial.uniforms.uTime.value = time;

    if (sunRef.current) sunRef.current.rotation.y += delta * 0.18;
    if (innerGlowRef.current) {
      innerGlowRef.current.rotation.y -= delta * 0.06;
      innerGlowRef.current.scale.setScalar(1 + Math.sin(time * 1.6) * 0.025);
    }
    if (outerGlowRef.current) {
      outerGlowRef.current.scale.setScalar(1 + Math.sin(time * 0.9) * 0.04);
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.z += delta * 0.045;
      coronaRef.current.scale.setScalar(1 + Math.sin(time * 0.7) * 0.035);
    }
  });

  return (
    <group>
      <pointLight color="#fff2c7" intensity={590} distance={170} decay={1.55} />
      <mesh ref={sunRef} material={sunMaterial}>
        <sphereGeometry args={[2.15, 128, 128]} />
      </mesh>
      <mesh ref={innerGlowRef}>
        <sphereGeometry args={[2.88, 96, 96]} />
        <meshBasicMaterial
          color="#ffb347"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[3.75, 96, 96]} />
        <meshBasicMaterial
          color="#ff7d33"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={coronaRef}>
        <ringGeometry args={[3.1, 4.55, 180]} />
        <meshBasicMaterial
          color="#ffd27a"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
