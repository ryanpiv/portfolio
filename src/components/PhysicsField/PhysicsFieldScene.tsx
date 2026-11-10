"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";

import type { FieldViewOptions, LabTheme, LabVariant } from "@data/lab";
import type { Project } from "@data/projects";

import { useFieldControls } from "./controls/useFieldControls";
import type { FieldInteraction } from "./fieldContext";
import { FieldWorld } from "./FieldWorld";

export type PhysicsFieldSceneProps = FieldInteraction & {
  projects: Project[];
  variant: LabVariant;
  theme: LabTheme;
  view: FieldViewOptions;
};

const CAMERA = { position: [0, 0, 18] as [number, number, number], fov: 45, near: 0.1, far: 200 };

/**
 * The WebGL scene. Loaded client-only via `next/dynamic` from `PhysicsField`.
 * Registers the Leva controls (the panel itself lives in the DOM shell) and
 * hands the resolved settings to `FieldWorld`.
 */
export default function PhysicsFieldScene({
  projects,
  variant,
  theme,
  view,
  ...interaction
}: PhysicsFieldSceneProps) {
  const [seed, setSeed] = useState(1);
  const { settings, paused } = useFieldControls({
    variant,
    theme,
    view,
    onReset: () => setSeed((value) => value + 1),
  });

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={CAMERA}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      style={{ touchAction: "none" }}
    >
      <Physics gravity={[0, 0, 0]} paused={paused} timeStep="vary">
        <FieldWorld projects={projects} settings={settings} seed={seed} interaction={interaction} />
      </Physics>
    </Canvas>
  );
}
