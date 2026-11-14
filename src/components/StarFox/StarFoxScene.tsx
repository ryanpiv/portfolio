"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type * as THREE from "three";

import { LabEffects, LabLighting } from "@components/LabScene";
import { labLighting, type LabTheme, type LightingPreset } from "@data/lab";

import { Enemies } from "./combat/Enemies";
import { Explosions } from "./combat/Explosions";
import { Lasers } from "./combat/Lasers";
import { useStarFoxControls } from "./controls/useStarFoxControls";
import { Ship } from "./entities/Ship";
import { GameContext } from "./gameContext";
import type { GameStore } from "./game/gameStore";
import { createSim } from "./game/sim";
import type { InputRef } from "./hooks/useInput";
import { ChaseCamera } from "./world/ChaseCamera";
import { Ground } from "./world/Ground";
import { Scenery } from "./world/Scenery";

export type StarFoxSceneProps = {
  theme: LabTheme;
  input: InputRef;
  store: GameStore;
};

/** The WebGL scene. Loaded client-only via `next/dynamic` from `StarFox`. */
export default function StarFoxScene({ theme, input, store }: StarFoxSceneProps) {
  const config = useStarFoxControls();
  const lighting = useMemo(() => gameLighting(labLighting[theme]), [theme]);
  const shipRef = useRef<THREE.Group | null>(null);
  const simRef = useRef(createSim());

  const context = useMemo(() => ({ config, lighting, shipRef, input, simRef, store }), [config, lighting, input, store]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: config.camera.offset, fov: config.camera.fov, near: 0.1, far: 500 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      style={{ touchAction: "none" }}
    >
      <GameContext.Provider value={context}>
        <CameraFov fov={config.camera.fov} />
        <LabLighting lighting={lighting} />
        <fog attach="fog" args={[lighting.background, config.world.fogNear, config.world.fogFar]} />
        <Ground />
        <Scenery key={config.world.sceneryCount} />
        {/* Sibling order is update order: ship moves, bolts fire from it, enemies test against bolts, debris spawns. */}
        <Ship />
        <Lasers />
        <Enemies />
        <Explosions />
        <ChaseCamera />
        <LabEffects lighting={lighting} />
      </GameContext.Provider>
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
