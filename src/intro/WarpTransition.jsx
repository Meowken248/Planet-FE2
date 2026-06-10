import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

const vortexVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const vortexFragmentShader = `
  uniform float uTime;
  uniform float uSpeed;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 uv = vUv;
    
    float twist = sin(uTime * 0.2) * 2.0;
    uv.x += twist * uv.y;
    uv.y -= uTime * uSpeed * 0.2;

    float strip = hash(vec2(floor(uv.x * 60.0), 0.0));
    float dash = fract(uv.y * 2.0 + strip * 5.0);
    dash = smoothstep(0.8, 1.0, dash);
    
    float intensity = dash * smoothstep(0.0, 0.2, uv.y) * smoothstep(1.0, 0.8, uv.y);
    
    vec3 color = mix(vec3(0.0, 0.5, 1.0), vec3(1.0, 0.8, 0.2), strip);
    color *= intensity * max(1.0, uSpeed * 0.5);
    
    gl_FragColor = vec4(color, intensity);
  }
`;

function PlasmaVortex({ active }) {
  const materialRef = useRef();
  const speedRef = useRef({ value: 0 });

  useEffect(() => {
    if (active) {
      gsap.to(speedRef.current, { value: 20.0, duration: 1.2, ease: "power3.in" });
    } else {
      speedRef.current.value = 0;
    }
  }, [active]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
      materialRef.current.uniforms.uSpeed.value = speedRef.current.value;
    }
  });

  return (
    <mesh position={[0, 0, -25]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[1.5, 15, 60, 64, 1, true]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vortexVertexShader}
        fragmentShader={vortexFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uSpeed: { value: 0 }
        }}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function WarpStars({ active, onFlash }) {
  const count = 1200;
  const meshRef = useRef();
  const speedRef = useRef({ value: 0 });
  const aberrationRef = useRef({ value: 0 });
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const radius = 2 + Math.random() * 45;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -Math.random() * 300;
      const length = 0.5 + Math.random() * 1.5;
      temp.push({ x, y, z, length });
    }
    return temp;
  }, [count]);

  useEffect(() => {
    if (active) {
      gsap.to(speedRef.current, { value: 500, duration: 1.2, ease: "power3.in" });
      gsap.to(aberrationRef.current, { value: 0.12, duration: 1.2, ease: "power2.in" });
      
      gsap.delayedCall(1.0, () => {
         onFlash();
      });
    } else {
      speedRef.current.value = 0;
      aberrationRef.current.value = 0;
    }
  }, [active, onFlash]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    const speed = speedRef.current.value;
    const currentSpeed = speed > 0 ? speed : 2; 
    
    particles.forEach((p, i) => {
      p.z += currentSpeed * delta;
      if (p.z > 5) p.z -= 300;
      
      dummy.position.set(p.x, p.y, p.z);
      const stretch = Math.max(0.1, currentSpeed * 0.02) * p.length;
      dummy.scale.set(0.04, 0.04, stretch);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      
      const color = new THREE.Color();
      const brightness = Math.min(3.5, 0.8 + currentSpeed * 0.008);
      color.setHSL(0.55, 0.9, brightness);
      meshRef.current.setColorAt(i, color);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.2} mipmapBlur intensity={2.5} />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.008, 0.008)}
        />
      </EffectComposer>
    </>
  );
}

export default function WarpTransition({ active }) {
  const [flash, setFlash] = useState(false);
  const flashRef = useRef(null);

  useEffect(() => {
    if (!active) setFlash(false);
  }, [active]);

  const handleFlash = () => {
    setFlash(true);
    if (flashRef.current) {
      gsap.killTweensOf(flashRef.current);
      gsap.timeline({
        onComplete: () => setFlash(false),
      })
        .fromTo(
          flashRef.current,
          { opacity: 0 },
          { opacity: 0.58, duration: 0.08, ease: "power2.out" }
        )
        .to(flashRef.current, {
          opacity: 0,
          duration: 0.55,
          ease: "power3.out",
        });
    }
  };

  return (
    <div className={`warp-transition ${active ? 'active' : ''}`} aria-hidden={!active}>
      {active && (
        <Canvas camera={{ fov: 75, position: [0, 0, 0] }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <PlasmaVortex active={active} />
          <WarpStars active={active} onFlash={handleFlash} />
        </Canvas>
      )}
      <div 
        ref={flashRef}
        className="warp-flash-bang" 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.88), rgba(143,218,255,0.46) 28%, rgba(0,0,0,0) 64%)',
          opacity: 0,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          display: flash ? 'block' : 'none',
          zIndex: 10
        }} 
      />
    </div>
  );
}
