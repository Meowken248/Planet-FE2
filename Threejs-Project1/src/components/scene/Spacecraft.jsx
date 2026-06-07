import React from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { planetMap } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';

const missionDuration = 9.5;

function getCurvePoint(start, control, end, progress, target) {
  const oneMinus = 1 - progress;
  target
    .copy(start)
    .multiplyScalar(oneMinus * oneMinus)
    .addScaledVector(control, 2 * oneMinus * progress)
    .addScaledVector(end, progress * progress);
  return target;
}

export default function Spacecraft() {
  const shipRef = useRef();
  const modelRef = useRef();
  const trailRef = useRef();
  const missionIdRef = useRef(0);
  const localProgressRef = useRef(0);
  const telemetryTimerRef = useRef(0);
  const startRef = useRef(new THREE.Vector3());
  const endRef = useRef(new THREE.Vector3());
  const controlRef = useRef(new THREE.Vector3());
  const position = useMemo(() => new THREE.Vector3(), []);
  const nextPosition = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const liveTarget = useMemo(() => new THREE.Vector3(), []);
  const landingTarget = useMemo(() => new THREE.Vector3(), []);
  const surfaceNormal = useMemo(() => new THREE.Vector3(), []);
  const cameraDirection = useMemo(() => new THREE.Vector3(), []);
  const desiredControl = useMemo(() => new THREE.Vector3(), []);
  const arcOffset = useMemo(() => new THREE.Vector3(), []);
  const forward = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const linePoints = useMemo(
    () => Array.from({ length: 48 }, () => new THREE.Vector3()),
    []
  );
  const gltf = useGLTF('/models/cassini.glb');
  const { camera } = useThree();

  const mission = useSolarStore((state) => state.mission);
  const isVisible = mission.status !== 'idle';

  useFrame((_, delta) => {
    const state = useSolarStore.getState();
    const activeMission = state.mission;

    if (activeMission.status === 'idle') {
      return;
    }

    const earth = state.planetPositions.earth;
    const target = state.planetPositions[activeMission.targetId];

    if (!earth || !target) {
      return;
    }

    if (missionIdRef.current !== activeMission.id) {
      missionIdRef.current = activeMission.id;
      localProgressRef.current = 0;
      startRef.current.fromArray(earth);
      liveTarget.fromArray(target);
      const targetPlanet = planetMap[activeMission.targetId];
      const landingRadius = targetPlanet ? targetPlanet.radius + 0.2 : 1.1;
      camera.getWorldDirection(cameraDirection);
      surfaceNormal.copy(cameraDirection).multiplyScalar(-1).normalize();
      landingTarget.copy(liveTarget).addScaledVector(surfaceNormal, landingRadius);
      endRef.current.copy(landingTarget);

      const distance = startRef.current.distanceTo(endRef.current);
      const arcHeight = Math.max(4.5, distance * 0.34);
      controlRef.current
        .copy(startRef.current)
        .lerp(endRef.current, 0.5)
        .add(arcOffset.set(0, arcHeight, 0));
    }

    liveTarget.fromArray(target);
    const targetPlanet = planetMap[activeMission.targetId];
    const landingRadius = targetPlanet ? targetPlanet.radius + 0.2 : 1.1;
    camera.getWorldDirection(cameraDirection);
    surfaceNormal.copy(cameraDirection).multiplyScalar(-1).normalize();
    landingTarget.copy(liveTarget).addScaledVector(surfaceNormal, landingRadius);

    if (activeMission.status === 'launch' || activeMission.status === 'cruise') {
      localProgressRef.current = Math.min(
        1,
        localProgressRef.current + delta / missionDuration
      );
    }

    const easedProgress = THREE.MathUtils.smoothstep(localProgressRef.current, 0, 1);
    const homing = THREE.MathUtils.smoothstep(easedProgress, 0.35, 1);
    const endFollowStrength = THREE.MathUtils.lerp(0.025, 0.55, homing);

    endRef.current.lerp(landingTarget, endFollowStrength);
    if (easedProgress > 0.985) {
      endRef.current.copy(landingTarget);
    }

    const distance = startRef.current.distanceTo(endRef.current);
    const arcHeight = Math.max(4.5, distance * 0.34);
    desiredControl
      .copy(startRef.current)
      .lerp(endRef.current, 0.5)
      .add(arcOffset.set(0, arcHeight, 0));
    controlRef.current.lerp(desiredControl, THREE.MathUtils.lerp(0.035, 0.22, homing));

    getCurvePoint(startRef.current, controlRef.current, endRef.current, easedProgress, position);
    getCurvePoint(
      startRef.current,
      controlRef.current,
      endRef.current,
      Math.min(1, easedProgress + 0.01),
      nextPosition
    );

    if (shipRef.current) {
      shipRef.current.position.copy(position);
      if (easedProgress > 0.97) {
        direction.copy(surfaceNormal).normalize();
      } else {
        direction.copy(nextPosition).sub(position).normalize();
      }
      shipRef.current.quaternion.slerp(
        targetQuaternion.setFromUnitVectors(forward, direction),
        0.18
      );

      if (modelRef.current) {
        modelRef.current.rotation.y += delta * 0.18;
      }
    }

    const spacecraftPosition = state.mission.spacecraftPosition;
    spacecraftPosition[0] = position.x;
    spacecraftPosition[1] = position.y;
    spacecraftPosition[2] = position.z;

    if (trailRef.current) {
      linePoints.forEach((point, index) => {
        const pointProgress = (index / (linePoints.length - 1)) * Math.max(easedProgress, 0.08);
        getCurvePoint(startRef.current, controlRef.current, endRef.current, pointProgress, point);
      });
      trailRef.current.geometry.setFromPoints(linePoints);
      trailRef.current.geometry.computeBoundingSphere();
    }

    if (activeMission.status === 'scan') {
      return;
    }

    telemetryTimerRef.current += delta;
    if (telemetryTimerRef.current > 0.12 || easedProgress >= 1) {
      telemetryTimerRef.current = 0;
      const remaining = Math.max(0, missionDuration * (1 - localProgressRef.current));
      const speed = 6200 + Math.sin(easedProgress * Math.PI) * 14800;
      const fuel = Math.max(0, 100 - easedProgress * 74);

      state.setMissionTelemetry({
        status: easedProgress >= 0.18 ? 'cruise' : 'launch',
        progress: easedProgress,
        fuel,
        speed,
        distance: position.distanceTo(endRef.current),
        eta: easedProgress >= 1 ? 'Đã đến' : `${remaining.toFixed(1)}s`,
        signal: easedProgress > 0.82 ? 'ĐANG TIẾP CẬN' : easedProgress > 0.18 ? 'ĐANG BAY' : 'ĐANG PHÓNG',
      });
    }

    if (localProgressRef.current >= 1 && activeMission.status !== 'scan') {
      state.completeMission();
    }
  });

  if (!isVisible) {
    return null;
  }

  return (
    <group>
      <line ref={trailRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#76ddff" transparent opacity={0.74} />
      </line>
      <group ref={shipRef} scale={0.012}>
        <primitive
          ref={modelRef}
          object={gltf.scene}
          rotation={[0, Math.PI, 0]}
        />
        <pointLight color="#76ddff" intensity={1.6} distance={7} />
        <mesh position={[0, 0, -44]} scale={24}>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshBasicMaterial color="#ffca62" transparent opacity={0.78} />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload('/models/cassini.glb');
