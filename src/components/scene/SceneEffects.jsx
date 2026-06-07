import React, { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export default function SceneEffects() {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    const effectComposer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.62,
      0.58,
      0.72
    );
    const outputPass = new OutputPass();

    effectComposer.addPass(renderPass);
    effectComposer.addPass(bloomPass);
    effectComposer.addPass(outputPass);
    return effectComposer;
  }, [camera, gl, scene, size.height, size.width]);

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.08;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  }, [composer, size.height, size.width]);

  useFrame(() => {
    composer.render();
  }, 1);

  return null;
}
