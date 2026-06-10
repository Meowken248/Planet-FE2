import React, { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const nebulaVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nebulaFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.55;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.52;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= 1.72;
    float ribbon = exp(-pow(abs(uv.y + sin(uv.x * 2.2 + uTime * 0.04) * 0.18), 1.45) * 4.0);
    float clouds = fbm(uv * 2.4 + vec2(uTime * 0.015, -uTime * 0.01));
    float fine = fbm(uv * 8.0 - vec2(uTime * 0.02, uTime * 0.03));
    float alpha = smoothstep(0.16, 0.82, clouds * ribbon + fine * 0.22) * 0.55;
    vec3 deep = vec3(0.02, 0.09, 0.18);
    vec3 cyan = vec3(0.18, 0.78, 1.0);
    vec3 amber = vec3(1.0, 0.48, 0.16);
    vec3 violet = vec3(0.45, 0.28, 0.95);
    vec3 color = mix(deep, cyan, clouds);
    color = mix(color, amber, smoothstep(0.55, 0.92, fine) * 0.55);
    color += violet * pow(ribbon, 2.0) * 0.28;
    gl_FragColor = vec4(color, alpha);
  }
`;

const sections = [
  {
    kicker: 'SolarVerse',
    title: 'Mở bản đồ sống của Hệ Mặt Trời',
    body: 'Một hành trình 3D đưa bạn bay qua Mặt Trời, quỹ đạo và các hành tinh bằng chuyển động điện ảnh.',
  },
  {
    kicker: 'Mặt Trời',
    title: 'Trái tim rực sáng của mọi quỹ đạo',
    body: 'Ánh sáng, năng lượng và lực hấp dẫn của Mặt Trời dẫn dắt toàn bộ khung cảnh.',
  },
  {
    kicker: 'Hành tinh đá',
    title: 'Những thế giới gần Mặt Trời',
    body: 'Sao Thủy, Sao Kim, Trái Đất và Sao Hỏa hiện lên như các điểm dừng trong một chuyến bay khám phá.',
  },
  {
    kicker: 'Khổng lồ khí',
    title: 'Vành đai, bão lớn và những hành tinh xa',
    body: 'Sao Mộc, Sao Thổ, Thiên Vương và Hải Vương tạo nên phần sâu thẳm nhất của hành trình.',
  },
  {
    kicker: 'NASA/JPL',
    title: 'Quỹ đạo có thể dùng dữ liệu thật',
    body: 'Chế độ Thực tế kết nối JPL Horizons để mô phỏng vị trí hành tinh theo thời gian.',
  },
  {
    kicker: 'Thiên thư',
    title: 'Mở cuốn sách của Hệ Mặt Trời',
    body: 'Chạm vào bìa sách để đánh thức các hành tinh, rồi bước vào mô phỏng SolarVerse.',
    final: true,
  },
];

const bookPlanets = [
  { name: 'Sao Thủy', texture: '/planets/mercury.jpg', className: 'mercury' },
  { name: 'Sao Kim', texture: '/planets/venus.jpg', className: 'venus' },
  { name: 'Trái Đất', texture: '/planets/earth.jpg', className: 'earth' },
  { name: 'Sao Hỏa', texture: '/planets/mars.jpg', className: 'mars' },
  { name: 'Sao Mộc', texture: '/planets/jupiter.jpg', className: 'jupiter' },
  { name: 'Sao Thổ', texture: '/planets/saturn.jpg', className: 'saturn' },
  { name: 'Thiên Vương', texture: '/planets/uranus.jpg', className: 'uranus' },
  { name: 'Hải Vương', texture: '/planets/neptune.jpg', className: 'neptune' },
];

function IntroPlanet({ textureUrl, position, radius, speed = 0.2, rings = false }) {
  const groupRef = useRef();
  const texture = useTexture(textureUrl);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * speed;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={0.8} metalness={0.02} />
      </mesh>
      {rings && (
        <mesh rotation-x={Math.PI / 2.35}>
          <ringGeometry args={[radius * 1.35, radius * 2.12, 160]} />
          <meshBasicMaterial color="#d8bd82" transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function NebulaBackdrop() {
  const meshRef = useRef();
  const offset = useMemo(() => new THREE.Vector3(0, 0, -82), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: nebulaVertexShader,
        fragmentShader: nebulaFragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame(({ camera, clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    if (!meshRef.current) return;
    target.copy(offset).applyQuaternion(camera.quaternion).add(camera.position);
    meshRef.current.position.copy(target);
    meshRef.current.quaternion.copy(camera.quaternion);
  });

  return (
    <mesh ref={meshRef} renderOrder={-10}>
      <planeGeometry args={[128, 72]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function StarRiver() {
  const pointsRef = useRef();
  const { positions, colors } = useMemo(() => {
    const count = 850;
    const nextPositions = new Float32Array(count * 3);
    const nextColors = new Float32Array(count * 3);
    const colorA = new THREE.Color('#78e7ff');
    const colorB = new THREE.Color('#ffd27a');

    for (let i = 0; i < count; i += 1) {
      const t = i / count;
      const angle = t * Math.PI * 8.5;
      const radius = 4.5 + t * 18 + Math.sin(t * 28) * 0.8;
      nextPositions[i * 3] = Math.cos(angle) * radius;
      nextPositions[i * 3 + 1] = -1.4 + Math.sin(angle * 0.72) * 1.2 + t * 2.6;
      nextPositions[i * 3 + 2] = -t * 48 + Math.sin(angle) * 2.2;

      const color = colorA.clone().lerp(colorB, Math.sin(t * Math.PI * 3) * 0.5 + 0.5);
      nextColors[i * 3] = color.r;
      nextColors[i * 3 + 1] = color.g;
      nextColors[i * 3 + 2] = color.b;
    }

    return { positions: nextPositions, colors: nextColors };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.018;
    pointsRef.current.rotation.z = Math.sin(performance.now() * 0.00018) * 0.035;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.055} vertexColors transparent opacity={0.72} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function OrbitRibbons() {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.025;
  });

  return (
    <group ref={groupRef} rotation-x={Math.PI / 2.42} position={[0, -0.28, -8]}>
      {[4.2, 6.7, 9.4, 13.2, 18.4].map((radius, index) => (
        <mesh key={radius} rotation-z={index * 0.17}>
          <torusGeometry args={[radius, 0.01 + index * 0.002, 8, 256]} />
          <meshBasicMaterial
            color={index % 2 ? '#ffbd65' : '#65dcff'}
            transparent
            opacity={0.2 - index * 0.022}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function SpaceGate({ progress }) {
  const groupRef = useRef();
  const intensity = THREE.MathUtils.smoothstep(progress, 0.78, 0.98);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += delta * (0.16 + intensity * 0.6);
  });

  return (
    <group ref={groupRef} position={[0, -0.2, -18]} scale={1 + intensity * 0.34}>
      <mesh>
        <torusGeometry args={[3.35, 0.045, 18, 224]} />
        <meshBasicMaterial color="#89efff" transparent opacity={0.28 + intensity * 0.55} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation-z={Math.PI / 3}>
        <torusGeometry args={[2.55, 0.018, 12, 192]} />
        <meshBasicMaterial color="#ffe2a8" transparent opacity={0.16 + intensity * 0.36} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <circleGeometry args={[2.52, 128]} />
        <meshBasicMaterial color="#63d5ff" transparent opacity={0.035 + intensity * 0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh rotation-z={-Math.PI / 5}>
        <ringGeometry args={[3.75, 3.82, 192]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06 + intensity * 0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function IntroScene({ progress, pointer }) {
  const sunTexture = useTexture('/planets/sun.jpg');
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);
  const cameraPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, clock }) => {
    const p = THREE.MathUtils.clamp(progress, 0, 1);
    const angle = p * Math.PI * 2.05 - 0.65;
    const distance = THREE.MathUtils.lerp(28, 9.5, Math.min(1, p * 1.12));
    const height = THREE.MathUtils.lerp(8.5, 2.6, p) + Math.sin(p * Math.PI * 3) * 1.4;
    cameraPosition.set(
      Math.cos(angle) * distance + pointer.x * 1.2,
      height + pointer.y * 0.55,
      Math.sin(angle) * distance + 12 - p * 24
    );
    cameraTarget.set(0, -0.1, -p * 9);
    camera.position.lerp(cameraPosition, 0.045);
    camera.lookAt(cameraTarget);
    camera.rotation.z += Math.sin(clock.elapsedTime * 0.18) * 0.002;
  });

  return (
    <>
      <color attach="background" args={['#02040b']} />
      <fog attach="fog" args={['#02040b', 22, 88]} />
      <NebulaBackdrop />
      <ambientLight intensity={0.18} />
      <pointLight position={[0, 0, 0]} color="#ffe1a3" intensity={95} distance={88} />
      <pointLight position={[-7, 5, -11]} color="#79e5ff" intensity={18} distance={36} />
      <Stars radius={120} depth={70} count={2600} factor={3.8} saturation={0.18} fade speed={0.3} />
      <StarRiver />
      <OrbitRibbons />

      <group position={[0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[2.1, 96, 96]} />
          <meshBasicMaterial map={sunTexture} color="#ffcf78" />
        </mesh>
        <mesh>
          <sphereGeometry args={[2.65, 64, 64]} />
          <meshBasicMaterial color="#ff9d31" transparent opacity={0.12} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      <IntroPlanet textureUrl="/planets/earth.jpg" position={[-5.8, -0.6, -6]} radius={0.72} speed={0.34} />
      <IntroPlanet textureUrl="/planets/mars.jpg" position={[4.8, -1.25, -9.5]} radius={0.5} speed={0.28} />
      <IntroPlanet textureUrl="/planets/jupiter.jpg" position={[-8.6, -1.2, -18]} radius={1.45} speed={0.16} />
      <IntroPlanet textureUrl="/planets/saturn.jpg" position={[7.5, -0.65, -23]} radius={1.05} speed={0.14} rings />
      <IntroPlanet textureUrl="/planets/neptune.jpg" position={[1.4, 1.25, -30]} radius={0.76} speed={0.18} />

      <SpaceGate progress={progress} />
    </>
  );
}

export default function IntroExperience({ onStart }) {
  const [progress, setProgress] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const pointerRef = useRef({ x: 0, y: 0 });

  const handleScroll = useCallback((event) => {
    const target = event.currentTarget;
    const nextProgress = target.scrollTop / Math.max(1, target.scrollHeight - target.clientHeight);
    setProgress(nextProgress);
  }, []);

  const handlePointerMove = useCallback((event) => {
    pointerRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerRef.current.y = -(event.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  const startJourney = () => {
    if (launching) return;
    setLaunching(true);
    window.setTimeout(onStart, 1450);
  };

  return (
    <section className={`intro-experience ${launching ? 'is-launching' : ''}`} onPointerMove={handlePointerMove}>
      <Canvas camera={{ fov: 42, near: 0.1, far: 220, position: [0, 8, 32] }} dpr={[1, 1.7]} className="intro-canvas">
        <Suspense fallback={null}>
          <IntroScene progress={progress} pointer={pointerRef.current} />
        </Suspense>
      </Canvas>

      <div className="intro-scroll" onScroll={handleScroll}>
        {sections.map((section, index) => (
          <article key={section.title} className={`intro-section ${section.final ? `final ${bookOpen ? 'is-book-open' : ''}` : ''}`}>
            <div className="intro-copy" style={{ '--section-index': index }}>
              <p>{section.kicker}</p>
              <h1>{section.title}</h1>
              <span>{section.body}</span>
              {section.final && (
                <div className={`cosmic-book ${bookOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="book-stage"
                    onClick={() => setBookOpen(true)}
                    aria-label="Mở cuốn sách hành tinh"
                  >
                    <span className="book-shadow" />
                    <span className="book-spine" />
                    <span className="book-page left">
                      <span className="page-lines" />
                      <span className="page-orbit" />
                    </span>
                    <span className="book-page right">
                      <span className="page-lines" />
                      <span className="page-orbit" />
                    </span>
                    <span className="book-cover">
                      <span className="cover-sigil" />
                      <strong>SolarVerse</strong>
                      <small>Atlas of Planets</small>
                    </span>
                    <span className="book-planets" aria-hidden="true">
                      {bookPlanets.map((planet, planetIndex) => (
                        <span
                          key={planet.name}
                          className={`book-planet ${planet.className}`}
                          style={{
                            '--planet-index': planetIndex,
                            backgroundImage: `url(${planet.texture})`,
                          }}
                        >
                          <i>{planet.name}</i>
                        </span>
                      ))}
                    </span>
                  </button>

                  <div className="book-actions">
                    <button type="button" className="journey-button" onClick={bookOpen ? startJourney : () => setBookOpen(true)}>
                      <strong>{bookOpen ? 'Bước vào SolarVerse' : 'Mở cuốn sách'}</strong>
                      <i />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="intro-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
      </div>
      <div className="intro-hud">Scroll để mở cổng</div>
    </section>
  );
}
