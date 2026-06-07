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
  const previousTourActiveRef = useRef(false);
  const tourStartTimeRef = useRef(0);
  const flightRef = useRef({
    elapsed: 0,
    duration: 6.2,
    startPosition: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
  });
  const { camera } = useThree();
  const followingPlanetId = useSolarStore((state) => state.followingPlanetId);
  const cinematicTour = useSolarStore((state) => state.cinematicTour);

  const target = useMemo(() => new THREE.Vector3(), []);
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const viewDirection = useMemo(() => new THREE.Vector3(), []);
  const shipRadial = useMemo(() => new THREE.Vector3(), []);
  const tourTarget = useMemo(() => new THREE.Vector3(), []);
  const tourPosition = useMemo(() => new THREE.Vector3(), []);

  const tourTargetIds = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  const tourStepDuration = 7.2;

  const focusAngles = {
    saturn: -0.95,
    uranus: 2.35,
  };

  const easeInOutCubic = (value) =>
    value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

  useEffect(() => {
    camera.position.set(0, 10, 42);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame(({ clock }, delta) => {
    const currentMission = useSolarStore.getState().mission;

    if (cinematicTour.active && controlsRef.current) {
      if (!previousTourActiveRef.current) {
        previousTourActiveRef.current = true;
        tourStartTimeRef.current = clock.elapsedTime;
      }

      const tourIndex = cinematicTour.index % tourTargetIds.length;
      const targetId = tourTargetIds[tourIndex];
      const tourElapsed = clock.elapsedTime - tourStartTimeRef.current;
      const nextIndex = Math.floor(tourElapsed / tourStepDuration) % tourTargetIds.length;

      if (nextIndex !== tourIndex) {
        useSolarStore.getState().setCinematicTourIndex(nextIndex);
      }

      if (targetId === 'sun') {
        tourTarget.set(0, -0.8, 0);
        tourPosition.set(
          Math.cos(clock.elapsedTime * 0.12) * 10.5,
          4.5 + Math.sin(clock.elapsedTime * 0.18) * 0.9,
          Math.sin(clock.elapsedTime * 0.12) * 10.5
        );
      } else {
        const selected = planetMap[targetId];
        const planetPosition = useSolarStore.getState().planetPositions[targetId];

        if (selected && planetPosition) {
          const radius = selected.radius * 1.55;
          const angle = (focusAngles[targetId] ?? 0.72) + Math.sin(clock.elapsedTime * 0.16) * 0.22;
          const distance = Math.max(5.2, radius * 4.45);
          tourTarget.set(planetPosition[0], planetPosition[1], planetPosition[2]);
          tourPosition.set(
            planetPosition[0] + Math.cos(angle) * distance,
            planetPosition[1] + Math.max(1.3, radius * 1.05),
            planetPosition[2] + Math.sin(angle) * distance
          );
        }
      }

      camera.position.lerp(tourPosition, 0.018);
      controlsRef.current.target.lerp(tourTarget, 0.032);
      controlsRef.current.update();
      return;
    }
    previousTourActiveRef.current = false;

    if (currentMission.autopilot && controlsRef.current) {
      const ship = currentMission.spacecraftPosition;
      const isPatrolling = currentMission.status === 'idle';
      target.set(ship[0], ship[1], ship[2]);
      shipRadial.set(ship[0], ship[1] + 0.8, ship[2]);
      if (shipRadial.lengthSq() < 0.01) {
        shipRadial.set(1, 0.35, 1);
      }
      shipRadial.normalize();
      desiredPosition.set(
        ship[0] + shipRadial.x * (isPatrolling ? 4.2 : 6.8),
        ship[1] + (isPatrolling ? 2.2 : 3.8),
        ship[2] + shipRadial.z * (isPatrolling ? 4.2 : 6.8)
      );
      camera.position.lerp(desiredPosition, isPatrolling ? 0.035 : 0.045);
      controlsRef.current.target.lerp(target, isPatrolling ? 0.055 : 0.06);
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
      flightRef.current.startTarget.copy(controlsRef.current.target);
      flightRef.current.startPosition.copy(camera.position);
    }

    const selected = planetMap[followingPlanetId];
    const planetPosition = useSolarStore.getState().planetPositions[followingPlanetId];

    if (selected && planetPosition) {
      const visualRadius = selected.radius * 1.55;
      const focusDistance = Math.max(4.2, visualRadius * 4.15);
      const focusHeight = Math.max(1.15, visualRadius * 0.92);
      const cinematicDrift = Math.sin(clock.elapsedTime * 0.18) * 0.16;
      const focusAngle = (focusAngles[followingPlanetId] ?? 0.72) + cinematicDrift;
      viewDirection.set(Math.cos(focusAngle), 0, Math.sin(focusAngle)).normalize();

      target.set(planetPosition[0], planetPosition[1], planetPosition[2]);
      desiredPosition.set(
        planetPosition[0] + viewDirection.x * focusDistance,
        planetPosition[1] + focusHeight,
        planetPosition[2] + viewDirection.z * focusDistance
      );
    } else {
      target.set(0, 0, 0);
      desiredPosition.set(0, 10, 42);
    }

    if (isFlyingRef.current) {
      flightRef.current.elapsed += Math.min(delta, 0.05);
      const progress = Math.min(flightRef.current.elapsed / flightRef.current.duration, 1);
      const eased = easeInOutCubic(progress);

      camera.position.lerpVectors(flightRef.current.startPosition, desiredPosition, eased);
      controlsRef.current.target.lerpVectors(flightRef.current.startTarget, target, eased);
      controlsRef.current.update();

      if (progress >= 1) {
        camera.position.copy(desiredPosition);
        controlsRef.current.target.copy(target);
        controlsRef.current.update();
        isFlyingRef.current = false;
      }

      return;
    }

    camera.position.lerp(desiredPosition, 0.014);
    controlsRef.current.target.lerp(target, 0.028);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.095}
      rotateSpeed={0.48}
      zoomSpeed={0.72}
      panSpeed={0.58}
      minDistance={1.8}
      maxDistance={120}
      enablePan
      onStart={() => {
        useSolarStore.getState().disableMissionAutopilot();
        useSolarStore.getState().stopCinematicTour();
      }}
    />
  );
}













