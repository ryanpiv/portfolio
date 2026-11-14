"use client";

import type { ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type * as THREE from "three";

import { LabEffects, LabLighting } from "@components/LabScene";
import type { LightingPreset } from "@data/lab";

type SceneFrameProps = {
  lighting: LightingPreset;
  fog: { near: number; far: number };
  camera: { position: [number, number, number]; fov: number };
  children: ReactNode;
};

/** Canvas + lighting + fog + post-processing shared by every Star Fox mode. */
export function SceneFrame({ lighting, fog, camera, children }: SceneFrameProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: camera.position, fov: camera.fov, near: 0.1, far: 600 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      style={{ touchAction: "none" }}
    >
      <CameraFov fov={camera.fov} />
      <LabLighting lighting={lighting} />
      <fog attach="fog" args={[lighting.background, fog.near, fog.far]} />
      {children}
      <LabEffects lighting={lighting} />
    </Canvas>
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
