import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    type: 'hero',
    kicker: 'SolarVerse',
    title: 'Khám phá Hệ Mặt Trời trong chuyển động',
    accent: 'chuyển động',
    body: 'Bay qua các hành tinh, quỹ đạo thật, thế giới đang tự quay và một bản đồ sao sống động trước khi bước vào mô phỏng chính.',
  },
  {
    type: 'atlas',
    kicker: 'Star Atlas',
    title: 'Một bản đồ nơi mỗi quỹ đạo có câu chuyện riêng',
    accent: 'quỹ đạo',
    body: 'SolarVerse kết hợp cảm giác của thiên văn cổ điển với dữ liệu mô phỏng hiện đại, biến những con số lạnh thành một hành trình có chiều sâu.',
  },
  {
    type: 'planets',
    kicker: 'Planet Field Guide',
    title: 'Tám thế giới, tám nhịp chuyển động',
    accent: 'thế giới',
    body: 'Mỗi hành tinh hiện như một trang ghi chú khoa học: texture, bán kính, ngày tự quay, độ nghiêng và khoảng cách đều được trình bày gọn gàng.',
  },
  {
    type: 'data',
    kicker: 'Real Orbit Mode',
    title: 'Dữ liệu thật, chuyển động điện ảnh',
    accent: 'Dữ liệu',
    body: 'Vị trí quỹ đạo có thể lấy từ NASA/JPL Horizons theo ngày giờ, còn bán kính, tốc độ tự quay và độ nghiêng trục dựa trên NASA fact data.',
  },
  {
    type: 'tour',
    kicker: 'Cinematic Tour',
    title: 'Di chuyển từ hành tinh này sang hành tinh khác',
    accent: 'hành tinh',
    body: 'Camera được dẫn theo đường cong mềm, ánh sáng Mặt Trời tạo chiều sâu, orbit trail và halo giúp mỗi điểm dừng có cảm giác như một cảnh phim.',
  },
  {
    type: 'gateway',
    kicker: 'Star Gate',
    title: 'Kích hoạt cổng tinh đồ',
    accent: 'cổng',
    body: 'Chạm vào lõi tinh đồ để các hành tinh vào quỹ đạo, rồi bước thẳng vào mô phỏng SolarVerse.',
    final: true,
  },
];

const gatewayPlanets = [
  { name: 'Sao Thủy', texture: '/planets/mercury.jpg', className: 'mercury' },
  { name: 'Sao Kim', texture: '/planets/venus.jpg', className: 'venus' },
  { name: 'Trái Đất', texture: '/planets/earth.jpg', className: 'earth' },
  { name: 'Sao Hỏa', texture: '/planets/mars.jpg', className: 'mars' },
  { name: 'Sao Mộc', texture: '/planets/jupiter.jpg', className: 'jupiter' },
  { name: 'Sao Thổ', texture: '/planets/saturn.jpg', className: 'saturn' },
  { name: 'Thiên Vương', texture: '/planets/uranus.jpg', className: 'uranus' },
  { name: 'Hải Vương', texture: '/planets/neptune.jpg', className: 'neptune' },
];

const planetShowcase = [
  { name: 'Sao Thủy', texture: '/planets/mercury.jpg', radius: '2.440 km', day: '58,6 ngày', tilt: '0,03°', distance: '57,9 triệu km' },
  { name: 'Sao Kim', texture: '/planets/venus.jpg', radius: '6.052 km', day: '243 ngày', tilt: '177,4°', distance: '108,2 triệu km' },
  { name: 'Trái Đất', texture: '/planets/earth.jpg', radius: '6.371 km', day: '23,9 giờ', tilt: '23,4°', distance: '149,6 triệu km' },
  { name: 'Sao Hỏa', texture: '/planets/mars.jpg', radius: '3.390 km', day: '24,6 giờ', tilt: '25,2°', distance: '227,9 triệu km' },
  { name: 'Sao Mộc', texture: '/planets/jupiter.jpg', radius: '69.911 km', day: '9,9 giờ', tilt: '3,1°', distance: '778,5 triệu km' },
  { name: 'Sao Thổ', texture: '/planets/saturn.jpg', radius: '58.232 km', day: '10,7 giờ', tilt: '26,7°', distance: '1,43 tỷ km' },
  { name: 'Thiên Vương', texture: '/planets/uranus.jpg', radius: '25.362 km', day: '17,2 giờ', tilt: '97,8°', distance: '2,87 tỷ km' },
  { name: 'Hải Vương', texture: '/planets/neptune.jpg', radius: '24.622 km', day: '16,1 giờ', tilt: '28,3°', distance: '4,50 tỷ km' },
];

const statusBadges = ['LIVE', 'CACHE', 'FALLBACK'];

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

function SectionTitle({ section }) {
  const title = section.accent
    ? section.title.split(section.accent)
    : [section.title];

  return (
    <>
      <p>{section.kicker}</p>
      <h1>
        {title[0]}
        {section.accent && <em>{section.accent}</em>}
        {title[1]}
      </h1>
      <span>{section.body}</span>
    </>
  );
}

function IntroNav({ onStart }) {
  return (
    <nav className="intro-nav">
      <div className="intro-brand">
        <i />
        <strong>SolarVerse</strong>
      </div>
      <div className="intro-nav-links">
        <a href="#intro-hero">Home</a>
        <span>•</span>
        <a href="#intro-planets">Planets</a>
        <span>•</span>
        <a href="#intro-data">Real Orbit</a>
        <span>•</span>
        <a href="#intro-gateway">Mission</a>
      </div>
      <button type="button" onClick={onStart}>Enter Simulation</button>
    </nav>
  );
}

function StarAtlasVisual() {
  return (
    <div className="star-atlas-visual" aria-hidden="true">
      <span className="atlas-compass">N</span>
      <i className="atlas-orbit one" />
      <i className="atlas-orbit two" />
      <i className="atlas-orbit three" />
      <b className="atlas-node sun" />
      <b className="atlas-node earth" />
      <b className="atlas-node mars" />
      <b className="atlas-node jupiter" />
      <svg viewBox="0 0 320 220" role="img">
        <path d="M28 146 C72 70 118 48 182 76 C235 99 262 78 294 34" />
        <path d="M44 58 L79 92 L112 48 L151 84 L190 46 L231 72 L270 44" />
        <circle cx="44" cy="58" r="3" />
        <circle cx="79" cy="92" r="3" />
        <circle cx="112" cy="48" r="3" />
        <circle cx="151" cy="84" r="3" />
        <circle cx="190" cy="46" r="3" />
        <circle cx="231" cy="72" r="3" />
        <circle cx="270" cy="44" r="3" />
      </svg>
    </div>
  );
}

function PlanetGuide() {
  return (
    <div className="planet-guide">
      {planetShowcase.map((planet, index) => (
        <article key={planet.name} className="planet-guide-card" style={{ '--planet-delay': `${index * 55}ms` }}>
          <div className="planet-guide-orb" style={{ backgroundImage: `url(${planet.texture})` }} />
          <strong>{planet.name}</strong>
          <p>{planet.distance}</p>
          <dl>
            <div>
              <dt>Bán kính</dt>
              <dd>{planet.radius}</dd>
            </div>
            <div>
              <dt>Ngày</dt>
              <dd>{planet.day}</dd>
            </div>
            <div>
              <dt>Nghiêng</dt>
              <dd>{planet.tilt}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}

function RealDataPanel() {
  return (
    <div className="real-data-panel">
      <div className="data-status-row">
        {statusBadges.map((badge) => (
          <span key={badge}>{badge}</span>
        ))}
      </div>
      <div className="data-timeline">
        <i />
        <b />
      </div>
      <div className="data-orbit-preview">
        <span />
        <span />
        <span />
        <strong>UTC 2026-06-10</strong>
      </div>
      <dl>
        <div>
          <dt>Nguồn quỹ đạo</dt>
          <dd>JPL Horizons</dd>
        </div>
        <div>
          <dt>Fact data</dt>
          <dd>NASA</dd>
        </div>
        <div>
          <dt>Animate</dt>
          <dd>Nội suy cache</dd>
        </div>
      </dl>
    </div>
  );
}

function TourPathVisual() {
  return (
    <div className="tour-path-visual" aria-hidden="true">
      <svg viewBox="0 0 520 280">
        <path d="M36 214 C112 82 204 70 274 146 C346 226 408 118 484 54" />
        <circle cx="36" cy="214" r="11" />
        <circle cx="156" cy="96" r="18" />
        <circle cx="274" cy="146" r="14" />
        <circle cx="398" cy="128" r="24" />
        <circle cx="484" cy="54" r="10" />
      </svg>
      <span className="tour-ship" />
    </div>
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
      <fog attach="fog" args={['#02040b', 22, 88]} />
      <ambientLight intensity={0.12} />
      <pointLight position={[0, 0, 0]} color="#ffe1a3" intensity={95} distance={88} />
      <pointLight position={[-7, 5, -11]} color="#79e5ff" intensity={9} distance={36} />
      <Stars radius={180} depth={110} count={11000} factor={5.2} saturation={0.15} fade speed={0.22} />
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
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const scrollRafRef = useRef(0);
  const nextProgressRef = useRef(0);

  const handleScroll = useCallback((event) => {
    const target = event.currentTarget;
    nextProgressRef.current = target.scrollTop / Math.max(1, target.scrollHeight - target.clientHeight);
    if (scrollRafRef.current) return;
    scrollRafRef.current = window.requestAnimationFrame(() => {
      setProgress(nextProgressRef.current);
      scrollRafRef.current = 0;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    };
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

  const renderSectionBody = (section) => {
    if (section.type === 'hero') {
      return (
        <>
          <SectionTitle section={section} />
          <div className="intro-actions">
            <button type="button" onClick={() => document.getElementById('intro-gateway')?.scrollIntoView({ behavior: 'smooth' })}>
              Bắt đầu hành trình
            </button>
            <button type="button" onClick={() => document.getElementById('intro-planets')?.scrollIntoView({ behavior: 'smooth' })}>
              Xem hành tinh
            </button>
          </div>
          <small>Scroll để mở bản đồ sao</small>
        </>
      );
    }

    if (section.type === 'atlas') {
      return (
        <>
          <SectionTitle section={section} />
          <StarAtlasVisual />
        </>
      );
    }

    if (section.type === 'planets') {
      return (
        <>
          <SectionTitle section={section} />
          <PlanetGuide />
        </>
      );
    }

    if (section.type === 'data') {
      return (
        <>
          <SectionTitle section={section} />
          <RealDataPanel />
        </>
      );
    }

    if (section.type === 'tour') {
      return (
        <>
          <SectionTitle section={section} />
          <TourPathVisual />
        </>
      );
    }

    return (
      <>
        <SectionTitle section={section} />
        <div className={`star-gateway ${gatewayOpen ? 'is-open' : ''}`}>
          <button
            type="button"
            className="gateway-stage"
            onClick={() => setGatewayOpen(true)}
            aria-label="Kích hoạt cổng tinh đồ"
          >
            <span className="gateway-aura" />
            <span className="gateway-ring outer" />
            <span className="gateway-ring middle" />
            <span className="gateway-ring inner" />
            <span className="gateway-grid" />
            <span className="gateway-core">
              <strong>SolarVerse</strong>
              <small>{gatewayOpen ? 'Orbit Locked' : 'Activate Atlas'}</small>
            </span>
            <span className="gateway-planets" aria-hidden="true">
              {gatewayPlanets.map((planet, planetIndex) => (
                <span
                  key={planet.name}
                  className={`gateway-planet ${planet.className}`}
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

          <div className="gateway-actions">
            <button type="button" className="journey-button" onClick={gatewayOpen ? startJourney : () => setGatewayOpen(true)}>
              <strong>{gatewayOpen ? 'Bước vào SolarVerse' : 'Kích hoạt cổng'}</strong>
              <i />
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <section className={`intro-experience ${launching ? 'is-launching' : ''}`} onPointerMove={handlePointerMove}>
      <IntroNav onStart={startJourney} />
      <Canvas camera={{ fov: 42, near: 0.1, far: 220, position: [0, 8, 32] }} dpr={[1, 1.7]} className="intro-canvas">
        <Suspense fallback={null}>
          <IntroScene progress={progress} pointer={pointerRef.current} />
        </Suspense>
      </Canvas>

      <div className="intro-scroll" onScroll={handleScroll}>
        {sections.map((section, index) => (
          <article
            id={`intro-${section.type}`}
            key={section.title}
            className={`intro-section intro-section-${section.type} ${section.final ? `final ${gatewayOpen ? 'is-gateway-open' : ''}` : ''}`}
          >
            <div className="intro-copy" style={{ '--section-index': index }}>
              {renderSectionBody(section)}
            </div>
          </article>
        ))}
      </div>

      <div className="intro-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
      </div>
      <div className="intro-hud">Scroll để mở bản đồ sao</div>
    </section>
  );
}
