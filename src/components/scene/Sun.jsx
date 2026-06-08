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
    vec3 whiteHot = vec3(1.0, 0.86, 0.45);
    vec3 color = mix(deepOrange, gold, hot);
    color = mix(color, whiteHot, pow(hot, 3.0) * 0.42);
    color *= tex * 1.02;
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(cameraPosition - vWorldPosition))), 2.2);
    color += vec3(1.0, 0.34, 0.06) * rim * 0.38;
    gl_FragColor = vec4(color, 1.0);
  }
`;

const heatShellVertexShader = `
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

const heatShellFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      value += noise(p) * amp;
      p *= 2.05;
      amp *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float rim = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 2.15);
    float plasma = fbm(vUv * 8.5 + vec2(uTime * 0.08, -uTime * 0.045));
    float sparks = smoothstep(0.58, 0.92, plasma);
    vec3 amber = vec3(1.0, 0.36, 0.04);
    vec3 yellow = vec3(1.0, 0.82, 0.22);
    vec3 whiteHot = vec3(1.0, 0.88, 0.52);
    vec3 color = mix(amber, yellow, plasma);
    color = mix(color, whiteHot, sparks * 0.26);
    float alpha = 0.045 + rim * 0.16 + sparks * 0.03;
    alpha *= smoothstep(0.05, 0.24, rim + plasma * 0.28);
    gl_FragColor = vec4(color, alpha);
  }
`;

export default function Sun() {
  const sunRef = useRef();
  const heatShellRef = useRef();
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

  const heatShellMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: heatShellVertexShader,
        fragmentShader: heatShellFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    []
  );

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime;
    sunMaterial.uniforms.uTime.value = time;
    heatShellMaterial.uniforms.uTime.value = time;

    if (sunRef.current) sunRef.current.rotation.y += delta * 0.18;
    if (heatShellRef.current) {
      heatShellRef.current.rotation.y -= delta * 0.08;
      heatShellRef.current.rotation.z += delta * 0.025;
      heatShellRef.current.scale.setScalar(1 + Math.sin(time * 1.35) * 0.012);
    }
  });

  return (
    <group>
      <pointLight color="#fff2c7" intensity={560} distance={190} decay={1.45} />
      <pointLight color="#ffb45f" intensity={34} distance={34} decay={1.2} />
      <mesh ref={sunRef} material={sunMaterial}>
        <sphereGeometry args={[2.15, 128, 128]} />
      </mesh>
      <mesh ref={heatShellRef} material={heatShellMaterial}>
        <sphereGeometry args={[2.34, 128, 128]} />
      </mesh>
    </group>
  );
}
