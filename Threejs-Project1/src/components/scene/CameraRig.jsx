import React from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { planetMap } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function CameraRig() {
  const controlsRef = useRef();
  const isFlyingRef = useRef(true);
  const previousSelectionRef = useRef(null);
  const flightRef = useRef({
    elapsed: 0,
    duration: 3.2,
    startPosition: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
  });
  const { camera } = useThree();
  const followingPlanetId = useSolarStore((state) => state.followingPlanetId);

  const target = useMemo(() => new THREE.Vector3(), []);
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);

  const easeInOutCubic = (value) =>
    value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

  useEffect(() => {
    camera.position.set(0, 10, 42);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((_, delta) => {
    const currentMission = useSolarStore.getState().mission;

    if (currentMission.autopilot && currentMission.status !== 'idle' && controlsRef.current) {
      const ship = currentMission.spacecraftPosition;
      target.set(ship[0], ship[1], ship[2]);
      desiredPosition.set(ship[0] + 5.6, ship[1] + 3.4, ship[2] + 7.2);
      camera.position.lerp(desiredPosition, 0.045);
      controlsRef.current.target.lerp(target, 0.06);
      controlsRef.current.update();
      return;
    }

    if (!controlsRef.current) {
      return;
    }

    if (!followingPlanetId) {
      previousSelectionRef.current = null;
      return;
    }

    if (previousSelectionRef.current !== followingPlanetId) {
      previousSelectionRef.current = followingPlanetId;
      isFlyingRef.current = true;
      flightRef.current.elapsed = 0;

      if (controlsRef.current) {
        flightRef.current.startTarget.copy(controlsRef.current.target);
      }

      flightRef.current.startPosition.copy(camera.position);
    }

    const selected = planetMap[followingPlanetId];
    const planetPosition = useSolarStore.getState().planetPositions[followingPlanetId];

    if (selected && planetPosition) {
      target.set(planetPosition[0], planetPosition[1], planetPosition[2]);
      desiredPosition.set(
        planetPosition[0] + selected.radius * 1.8 + 3.8,
        planetPosition[1] + selected.radius * 2.2 + 2.6,
        planetPosition[2] + selected.radius * 5.2 + 7
      );
    } else {
      target.set(0, 0, 0);
      desiredPosition.set(0, 10, 42);
    }

    if (isFlyingRef.current) {
      flightRef.current.elapsed += Math.min(delta, 0.05);
      const progress = Math.min(flightRef.current.elapsed / flightRef.current.duration, 1);
      const eased = easeInOutCubic(progress);

      camera.position.lerpVectors(
        flightRef.current.startPosition,
        desiredPosition,
        eased
      );
      controlsRef.current.target.lerpVectors(
        flightRef.current.startTarget,
        target,
        eased
      );
      controlsRef.current.update();

      if (progress >= 1) {
        camera.position.copy(desiredPosition);
        controlsRef.current.target.copy(target);
        controlsRef.current.update();
        isFlyingRef.current = false;
      }

      return;
    }

    if (!isFlyingRef.current) {
      camera.position.lerp(desiredPosition, 0.035);
      controlsRef.current.target.lerp(target, 0.055);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.62}
      zoomSpeed={0.72}
      panSpeed={0.62}
      minDistance={2.8}
      maxDistance={110}
      enablePan
      onStart={() => {
        useSolarStore.getState().disableMissionAutopilot();
      }}
    />
  );
}
