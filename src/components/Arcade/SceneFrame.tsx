"use client";

import type { ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";

import { LabCanvas, LabEffects, LabLighting } from "@components/LabScene";
import type { LightingPreset, QualityPreset } from "@data/lab";

export type SceneQuality = {
  quality: QualityPreset;
  onDegrade: () => void;
};

type SceneFrameProps = SceneQuality & {
  lighting: LightingPreset;
  fog: { near: number; far: number };
  camera: { position: [number, number, number]; fov: number };
  children: ReactNode;
};

/** Canvas + lighting + fog + post-processing shared by every arcade mode. */
export function SceneFrame({ quality, onDegrade, lighting, fog, camera, children }: SceneFrameProps) {
  return (
    <LabCanvas
      quality={quality}
      onDegrade={onDegrade}
      camera={{ position: camera.position, fov: camera.fov, near: 0.1, far: 600 }}
    >
      <CameraFov fov={camera.fov} />
      <LabLighting lighting={lighting} />
      <fog attach="fog" args={[lighting.background, fog.near, fog.far]} />
      {children}
      <LabEffects lighting={lighting} quality={quality} />
    </LabCanvas>
  );
}

/**
 * The field presets are tuned for glowing spheres; here only HDR surfaces
 * (engine, lasers, enemy cores, debris) should bloom, so raise the threshold
 * and ease off the key light.
 */
export function gameLighting(preset: LightingPreset): LightingPreset {
  return {
    ...preset,
    key: { ...preset.key, intensity: preset.key.intensity * 0.7 },
    bloom: { ...preset.bloom, luminanceThreshold: Math.max(preset.bloom.luminanceThreshold, 0.9), intensity: 0.8 },
  };
}

/** Keeps the camera FOV in sync with the Leva slider. */
function CameraFov({ fov }: { fov: number }) {
  useFrame(({ camera }) => {
    const perspective = camera as THREE.PerspectiveCamera;
    if (perspective.fov === fov) return;
    perspective.fov = fov;
    perspective.updateProjectionMatrix();
  });
  return null;
}
