import React, { useState, useEffect, useRef, Suspense } from 'react';
import './intro-dashboard.css';
import { Canvas, useFrame } from '@react-three/fiber';
import { PresentationControls, Float, Stars, useTexture, Text } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

// --- Typewriter Component ---
function TypewriterText({ text, speed = 30 }) {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    let index = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayed((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  
  return <span>{displayed}<span className="typewriter-cursor">_</span></span>;
}

// --- 3D Components ---
function BlackHoleHologram() {
  const diskRef = useRef();
  const auraRef = useRef();

  useFrame((_, delta) => {
    if (diskRef.current) diskRef.current.rotation.z += delta * 0.5;
    if (auraRef.current) auraRef.current.rotation.y += delta * 0.2;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Event Horizon */}
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Photon Sphere */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[1.65, 64, 64]} />
        <meshBasicMaterial color={[5.0, 1.2, 0.2]} transparent opacity={0.6} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* Accretion Disk */}
      <mesh ref={diskRef} rotation-x={Math.PI / 2.2}>
        <torusGeometry args={[2.8, 0.5, 16, 128]} />
        <meshBasicMaterial color={[4.0, 1.5, 0.4]} transparent opacity={0.8} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      
      <mesh rotation-x={Math.PI / 2.2} rotation-y={0.1}>
        <torusGeometry args={[4.2, 0.2, 8, 128]} />
        <meshBasicMaterial color={[1.0, 0.5, 0.1]} transparent opacity={0.4} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

function IntroPlanet({ textureUrl, position, radius, speed, name }) {
  const texture = useTexture(textureUrl);
  const ref = useRef();
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!ref.current) return;
    angleRef.current += delta * speed;
    const distance = Math.sqrt(position[0]*position[0] + position[2]*position[2]);
    ref.current.position.x = Math.cos(angleRef.current) * distance;
    ref.current.position.z = Math.sin(angleRef.current) * distance;
    ref.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Orbit Trail */}
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[radius + 0.1, radius + 0.12, 64]} />
        <meshBasicMaterial color={[0.5, 1.0, 2.0]} transparent opacity={0.4} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <Text 
        position={[0, radius + 0.4, 0]} 
        fontSize={0.25} 
        color="#a8e6cf"
        anchorX="center" 
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {name}
      </Text>
    </group>
  );
}

function DashboardScene() {
  return (
    <>
      <fog attach="fog" args={['#02040b', 10, 50]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} color="#ffe1a3" intensity={50} distance={40} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <PresentationControls 
        global 
        config={{ mass: 2, tension: 500 }} 
        snap={{ mass: 4, tension: 1500 }} 
        rotation={[0.2, 0.4, 0]} 
        polar={[-Math.PI / 3, Math.PI / 3]} 
        azimuth={[-Math.PI / 1.4, Math.PI / 2]}
      >
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <BlackHoleHologram />
          
          <IntroPlanet name="EARTH" textureUrl="/planets/earth.jpg" position={[-4, 0, -4]} radius={0.5} speed={0.4} />
          <IntroPlanet name="MARS" textureUrl="/planets/mars.jpg" position={[6, 0, -2]} radius={0.35} speed={0.3} />
          <IntroPlanet name="JUPITER" textureUrl="/planets/jupiter.jpg" position={[-8, 0, 5]} radius={1.0} speed={0.15} />
        </Float>
      </PresentationControls>
    </>
  );
}

// --- Main Component ---
export default function IntroExperience({ onStart }) {
  const [launching, setLaunching] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    if (launching) return;
    setLaunching(true);
    gsap.to('.intro-dashboard-container', { opacity: 0, scale: 1.05, duration: 1.2, ease: "power2.inOut" });
    setTimeout(onStart, 1200);
  };

  return (
    <section className={`intro-dashboard-container ${launching ? 'is-launching' : ''}`}>
      {/* 3D Background */}
      <div className="dashboard-canvas-wrapper">
        <Canvas camera={{ fov: 45, position: [0, 2, 12] }} dpr={[1, 1.5]}>
          <Suspense fallback={null}>
            <DashboardScene />
            <EffectComposer disableNormalPass>
              <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
              <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.001, 0.001)} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="dashboard-ui-layer">
        
        {/* Left Panel */}
        <aside className="dashboard-left-panel liquid-glass-strong">
          <div className="dashboard-brand">
            <span className="brand-orb" />
            <h1>SOLARVERSE</h1>
            <small>ARCHIVE & MISSIONS</small>
          </div>
          
          <div className="dashboard-lore">
            <p className="lore-text">
              <TypewriterText text="Hệ thống đã kết nối. Chào mừng đến với SolarVerse - nơi lưu trữ dữ liệu các hành tinh, các nhiệm vụ phòng thủ không gian và hệ sinh thái đa chiều. Dùng chuột xoay màn hình để khám phá tọa độ không gian." speed={25} />
            </p>
          </div>

          <div className="dashboard-actions">
            <button className="btn-launch liquid-glass" onClick={handleStart}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
              KHỞI ĐỘNG HÀNH TRÌNH
            </button>
          </div>
        </aside>

        {/* Right Panel */}
        <aside className="dashboard-right-panel">
          <div className="dashboard-system-status liquid-glass">
            <div className="status-header">
              <span>SYSTEM STATUS</span>
              <strong style={{color: '#a8e6cf'}}>ONLINE</strong>
            </div>
            <div className="status-grid">
              <div className="status-item">
                <small>LOCAL TIME</small>
                <span>{time}</span>
              </div>
              <div className="status-item">
                <small>ACTIVE NODES</small>
                <span>8 / 8</span>
              </div>
            </div>
          </div>

          <div className="dashboard-feature-cards">
            <div className="feature-card liquid-glass-strong">
              <strong>Hologram 3D</strong>
              <p>Dùng chuột kéo và xoay trực tiếp các hành tinh trong không gian 3D.</p>
            </div>
            <div className="feature-card liquid-glass-strong">
              <strong>Giao diện Liquid Glass</strong>
              <p>Thiết kế bảng điều khiển cao cấp với độ bóng mượt vượt trội.</p>
            </div>
          </div>
        </aside>

        {/* Bottom Bar */}
        <footer className="dashboard-bottom-bar liquid-glass">
          <div className="bottom-metrics">
            <span>COORD: X-12.4 Y-8.9 Z-0.1</span>
            <span>FREQ: 144.20 MHz</span>
            <span>ORBIT: STABLE</span>
          </div>
        </footer>

      </div>
    </section>
  );
}
