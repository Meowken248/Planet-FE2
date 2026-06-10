import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ShooterThreeScene({ config }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const colorA = new THREE.Color(config.palette[0]);
    const colorB = new THREE.Color(config.palette[1]);
    const accent = new THREE.Color(config.accent);

    const positions = new Float32Array(900 * 3);
    const colors = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i += 1) {
      const index = i * 3;
      positions[index] = (Math.random() - 0.5) * 48;
      positions[index + 1] = (Math.random() - 0.5) * 25;
      positions[index + 2] = -Math.random() * 70;
      const color = i % 5 === 0 ? accent : i % 2 === 0 ? colorA : colorB;
      colors[index] = color.r;
      colors[index + 1] = color.g;
      colors[index + 2] = color.b;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        size: 0.075,
        vertexColors: true,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
      })
    );
    scene.add(stars);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(5.6, 0.018, 8, 180),
      new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
      })
    );
    ring.rotation.x = Math.PI * 0.56;
    ring.rotation.y = Math.PI * 0.12;
    ring.position.set(5.8, -1.2, -7);
    scene.add(ring);

    const grid = new THREE.Mesh(
      new THREE.IcosahedronGeometry(3.2, 2),
      new THREE.MeshBasicMaterial({
        color: colorA,
        wireframe: true,
        transparent: true,
        opacity: 0.11,
        blending: THREE.AdditiveBlending,
      })
    );
    grid.position.set(8.2, 1.2, -9);
    scene.add(grid);

    const resize = () => {
      const rect = host.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(1, rect.height);
      camera.updateProjectionMatrix();
    };

    let animationFrame = 0;
    const animate = (time) => {
      const t = time * 0.001;
      stars.rotation.y = t * 0.018;
      stars.position.x = Math.sin(t * 0.18) * 0.35;
      ring.rotation.z = t * 0.18;
      grid.rotation.x = t * 0.16;
      grid.rotation.y = t * 0.22;

      const starPositions = starGeometry.attributes.position;
      for (let i = 2; i < starPositions.array.length; i += 3) {
        starPositions.array[i] += 0.07;
        if (starPositions.array[i] > 8) {
          starPositions.array[i] = -70;
        }
      }
      starPositions.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      starGeometry.dispose();
      ring.geometry.dispose();
      ring.material.dispose();
      grid.geometry.dispose();
      grid.material.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [config]);

  return <div ref={hostRef} className="shooter-three-scene" />;
}
