import React from 'react';
import { Trail, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { planetMap } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';

const missionDuration = 9.5;
const solarOrigin = new THREE.Vector3(0, -0.8, 0);
const flightUp = new THREE.Vector3(0, 1, 0);
const tempNormal = new THREE.Vector3();

function EngineGlow({ activeRef }) {
  const glowRef = useRef();
  const haloRef = useRef();

  useFrame(({ clock }) => {
    const intensity = activeRef.current || 0;
    const pulse = 0.92 + Math.sin(clock.elapsedTime * 9) * 0.08;

    if (glowRef.current) {
      glowRef.current.scale.setScalar((4.2 + intensity * 3.2) * pulse);
      glowRef.current.material.opacity = 0.06 + intensity * 0.1;
    }

    if (haloRef.current) {
      haloRef.current.scale.setScalar((7 + intensity * 4.5) * pulse);
      haloRef.current.material.opacity = 0.012 + intensity * 0.028;
    }
  });

  return (
    <group>
      <Trail
        width={0.34}
        length={2.4}
        decay={7.5}
        local={false}
        stride={0.04}
        interval={1}
        color="#6feaff"
        attenuation={(width) => width * width}
      >
        <mesh ref={glowRef} position={[0, 0, -42]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshBasicMaterial
            color="#8eefff"
            transparent
            opacity={0.1}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </Trail>

      <mesh ref={haloRef} position={[0, 0, -45]}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshBasicMaterial
          color="#4abfff"
          transparent
          opacity={0.026}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function getSurfaceNormal(planetPosition, target) {
  target.copy(planetPosition).sub(solarOrigin);
  if (target.lengthSq() < 0.01) {
    target.set(1, 0, 0);
  }
  return target.normalize();
}

function getDockingPoint(planetId, planetPosition, target) {
  const planet = planetMap[planetId] || planetMap.earth;
  const normal = getSurfaceNormal(planetPosition, tempNormal);
  const landingOffset = Math.max(0.045, planet.radius * 0.045);
  const radius = planet ? planet.radius + landingOffset : 1.05;
  return target.copy(planetPosition).addScaledVector(normal, radius);
}

function getFlightPoint(start, end, progress, target) {
  const t = THREE.MathUtils.clamp(progress, 0, 1);
  const distance = start.distanceTo(end);
  const arcHeight = Math.max(0.65, Math.min(4.8, distance * 0.16));

  return target
    .copy(start)
    .lerp(end, t)
    .addScaledVector(flightUp, Math.sin(t * Math.PI) * arcHeight);
}

export default function Spacecraft() {
  const shipRef = useRef();
  const modelRef = useRef();
  const missionIdRef = useRef(0);
  const localProgressRef = useRef(0);
  const telemetryTimerRef = useRef(0);
  const engineIntensityRef = useRef(0);

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

    if (!homePosition) return;

    if (mission.status === 'idle') {
      tempHomePosition.fromArray(homePosition);
      getDockingPoint(homePlanetId, tempHomePosition, homeDock);
      targetNormal.copy(homeDock).sub(tempHomePosition).normalize();
      position.copy(homeDock);
      direction.copy(targetNormal);
      engineIntensityRef.current = THREE.MathUtils.lerp(engineIntensityRef.current, 0.08, 0.08);

      if (shipRef.current) {
        shipRef.current.position.copy(position);
        shipRef.current.quaternion.slerp(targetQuaternion.setFromUnitVectors(forward, direction), 0.22);
      }

      if (modelRef.current) {
        modelRef.current.rotation.y += delta * 0.02;
        modelRef.current.rotation.z = THREE.MathUtils.lerp(modelRef.current.rotation.z, 0, 0.08);
      }

      const spacecraftPosition = state.mission.spacecraftPosition;
      spacecraftPosition[0] = position.x;
      spacecraftPosition[1] = position.y;
      spacecraftPosition[2] = position.z;
      return;
    }

    const targetPlanetId = mission.targetId;
    const targetPosition = state.planetPositions[targetPlanetId];
    if (!targetPosition) return;

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

    const targetEngine = mission.status === 'launch' ? 0.82 : mission.status === 'cruise' ? 0.46 : mission.status === 'scan' ? 0.12 : 0.08;
    engineIntensityRef.current = THREE.MathUtils.lerp(engineIntensityRef.current, targetEngine, 0.08);

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
      const banking = Math.sin(progress * Math.PI) * 0.1;
      modelRef.current.rotation.y += delta * (0.06 + engineIntensityRef.current * 0.06);
      modelRef.current.rotation.z = THREE.MathUtils.lerp(modelRef.current.rotation.z, banking, 0.06);
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
      <pointLight color="#76ddff" intensity={1.05} distance={5} />
      <EngineGlow activeRef={engineIntensityRef} />
    </group>
  );
}

useGLTF.preload('/models/cassini.glb');



