import React from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { planetMap } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';

const missionDuration = 9.5;
const solarOrigin = new THREE.Vector3(0, -0.8, 0);
const flightUp = new THREE.Vector3(0, 1, 0);


function getSurfaceNormal(planetPosition, target) {
  target.copy(planetPosition).sub(solarOrigin);
  if (target.lengthSq() < 0.01) {
    target.set(1, 0, 0);
  }
  return target.normalize();
}

function getDockingPoint(planetId, planetPosition, target) {
  const planet = planetMap[planetId] || planetMap.earth;
  const normal = getSurfaceNormal(planetPosition, target);
  const landingOffset = Math.max(0.045, planet.radius * 0.045);
  const radius = planet ? planet.radius + landingOffset : 1.05;
  return target.copy(planetPosition).addScaledVector(normal, radius);
}

function getFlightPoint(start, end, progress, target) {
  const t = THREE.MathUtils.clamp(progress, 0, 1);
  const distance = start.distanceTo(end);
  const arcHeight = Math.max(0.65, Math.min(4.8, distance * 0.16));

  if (t < 0.72) {
    const arcT = THREE.MathUtils.smoothstep(t / 0.72, 0, 1);
    return target
      .copy(start)
      .lerp(end, arcT * 0.82)
      .addScaledVector(flightUp, Math.sin(arcT * Math.PI) * arcHeight);
  }

  const homeT = THREE.MathUtils.smoothstep((t - 0.72) / 0.28, 0, 1);
  return target
    .copy(start)
    .lerp(end, 0.82)
    .addScaledVector(flightUp, Math.sin(0.82 * Math.PI) * arcHeight)
    .lerp(end, homeT);
}
export default function Spacecraft() {
  const shipRef = useRef();
  const modelRef = useRef();
  const missionIdRef = useRef(0);
  const localProgressRef = useRef(0);
  const telemetryTimerRef = useRef(0);

  const startRef = useRef(new THREE.Vector3());
  const endRef = useRef(new THREE.Vector3());

  const position = useMemo(() => new THREE.Vector3(), []);
  const nextPosition = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const homeDock = useMemo(() => new THREE.Vector3(), []);
  const targetDock = useMemo(() => new THREE.Vector3(), []);
  const targetNormal = useMemo(() => new THREE.Vector3(), []);
  const tempHomePosition = useMemo(() => new THREE.Vector3(), []);
  const tempTargetPosition = useMemo(() => new THREE.Vector3(), []);
  const forward = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);

  const gltf = useGLTF('/models/cassini.glb');
  const shipModel = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    return clone;
  }, [gltf.scene]);

  useFrame((_, delta) => {
    const state = useSolarStore.getState();
    const mission = state.mission;
    const homePlanetId = state.spacecraftHomePlanetId || 'earth';
    const homePosition = state.planetPositions[homePlanetId] || state.planetPositions.earth;

    if (!homePosition) {
      return;
    }

    if (mission.status === 'idle') {
      tempHomePosition.fromArray(homePosition);
      getDockingPoint(homePlanetId, tempHomePosition, homeDock);
      targetNormal.copy(homeDock).sub(tempHomePosition).normalize();
      position.copy(homeDock);
      direction.copy(targetNormal);

      if (shipRef.current) {
        shipRef.current.position.copy(position);
        shipRef.current.quaternion.slerp(targetQuaternion.setFromUnitVectors(forward, direction), 0.22);
      }

      if (modelRef.current) {
        modelRef.current.rotation.y += delta * 0.02;
      }

      const spacecraftPosition = state.mission.spacecraftPosition;
      spacecraftPosition[0] = position.x;
      spacecraftPosition[1] = position.y;
      spacecraftPosition[2] = position.z;
      return;
    }

    const targetPlanetId = mission.targetId;
    const targetPosition = state.planetPositions[targetPlanetId];
    if (!targetPosition) {
      return;
    }

    tempTargetPosition.fromArray(targetPosition);
    getDockingPoint(targetPlanetId, tempTargetPosition, targetDock);
    targetNormal.copy(targetDock).sub(tempTargetPosition).normalize();

    if (missionIdRef.current !== mission.id) {
      missionIdRef.current = mission.id;
      localProgressRef.current = 0;
      tempHomePosition.fromArray(homePosition);
      getDockingPoint(homePlanetId, tempHomePosition, homeDock);
      startRef.current.copy(homeDock);
      endRef.current.copy(targetDock);
      position.copy(startRef.current);
    }

    if (mission.status === 'launch' || mission.status === 'cruise') {
      localProgressRef.current = Math.min(1, localProgressRef.current + delta / missionDuration);
    }

    const rawProgress = localProgressRef.current;
    const progress = THREE.MathUtils.smoothstep(rawProgress, 0, 1);
    endRef.current.copy(targetDock);

    getFlightPoint(startRef.current, endRef.current, progress, position);
    getFlightPoint(startRef.current, endRef.current, Math.min(1, progress + 0.014), nextPosition);

    direction.copy(progress > 0.985 ? targetNormal : nextPosition.sub(position)).normalize();

    if (shipRef.current) {
      shipRef.current.position.copy(position);
      shipRef.current.quaternion.slerp(targetQuaternion.setFromUnitVectors(forward, direction), 0.2);
    }

    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.12;
    }

    const spacecraftPosition = state.mission.spacecraftPosition;
    spacecraftPosition[0] = position.x;
    spacecraftPosition[1] = position.y;
    spacecraftPosition[2] = position.z;

    if (mission.status !== 'scan') {
      telemetryTimerRef.current += delta;
      if (telemetryTimerRef.current > 0.12 || progress >= 1) {
        telemetryTimerRef.current = 0;
        const remaining = Math.max(0, missionDuration * (1 - localProgressRef.current));
        const flightSpeed = 6200 + Math.sin(progress * Math.PI) * 14800;
        const fuel = Math.max(0, 100 - progress * 74);

        state.setMissionTelemetry({
          status: progress >= 0.18 ? 'cruise' : 'launch',
          progress: rawProgress,
          fuel,
          speed: flightSpeed,
          distance: position.distanceTo(targetDock),
          eta: rawProgress >= 1 ? 'Đã đến' : `${remaining.toFixed(1)}s`,
          signal: progress > 0.82 ? 'ĐANG TIẾP CẬN' : progress > 0.18 ? 'ĐANG BAY' : 'ĐANG PHÓNG',
        });
      }
    }

    if (rawProgress >= 1 && position.distanceTo(targetDock) < 0.08 && mission.status !== 'scan') {
      position.copy(targetDock);
      state.completeMission();
    }
  });

  return (
    <group ref={shipRef} scale={0.012}>
      <group ref={modelRef} rotation={[0, Math.PI, 0]}>
        <primitive object={shipModel} />
      </group>
      <pointLight color="#76ddff" intensity={1.6} distance={7} />
      <mesh position={[0, 0, -44]} scale={24}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshBasicMaterial color="#ffca62" transparent opacity={0.78} />
      </mesh>
    </group>
  );
}

useGLTF.preload('/models/cassini.glb');





