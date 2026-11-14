"use client";

import { useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type * as THREE from "three";

import { LabEffects, LabLighting } from "@components/LabScene";
import { labLighting, type LabTheme, type LightingPreset } from "@data/lab";

import { useStarFoxControls } from "./controls/useStarFoxControls";
import type { GameStore } from "./game/gameStore";
import { GameRun } from "./GameRun";
import type { InputRef } from "./hooks/useInput";

export type StarFoxSceneProps = {
  theme: LabTheme;
  input: InputRef;
  store: GameStore;
  /** Bump to start a fresh attempt. */
  runId: number;
};

/** The WebGL scene. Loaded client-only via `next/dynamic` from `StarFox`. */
export default function StarFoxScene({ theme, input, store, runId }: StarFoxSceneProps) {
  const config = useStarFoxControls();
  const lighting = useMemo(() => gameLighting(labLighting[theme]), [theme]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: config.camera.offset, fov: config.camera.fov, near: 0.1, far: 500 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      style={{ touchAction: "none" }}
    >
      <CameraFov fov={config.camera.fov} />
      <LabLighting lighting={lighting} />
      <fog attach="fog" args={[lighting.background, config.world.fogNear, config.world.fogFar]} />
      <GameRun key={runId} config={config} lighting={lighting} input={input} store={store} />
      <LabEffects lighting={lighting} />
    </Canvas>
  );
}

/**
 * The field presets are tuned for glowing spheres; here only HDR surfaces
 * (engine, lasers, enemy cores, debris) should bloom, so raise the threshold
 * and ease off the key light.
 */
function gameLighting(preset: LightingPreset): LightingPreset {
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
