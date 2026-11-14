"use client";

import { useState } from "react";
import { Physics } from "@react-three/rapier";

import { LabCanvas } from "@components/LabScene";
import type { EffectSettings, FieldViewOptions, LabTheme, LabVariant, QualityPreset } from "@data/lab";
import type { Project } from "@data/projects";

import { useFieldControls } from "./controls/useFieldControls";
import type { FieldInteraction } from "./fieldContext";
import { FieldWorld } from "./FieldWorld";

export type PhysicsFieldSceneProps = FieldInteraction & {
  projects: Project[];
  variant: LabVariant;
  theme: LabTheme;
  view: FieldViewOptions;
  quality: QualityPreset;
  onDegrade: () => void;
  effects: EffectSettings;
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
  quality,
  onDegrade,
  effects,
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
    <LabCanvas quality={quality} onDegrade={onDegrade} camera={CAMERA}>
      <Physics gravity={[0, 0, 0]} paused={paused} timeStep="vary">
        <FieldWorld
          projects={projects}
          settings={settings}
          quality={quality}
          effects={effects}
          seed={seed}
          interaction={interaction}
        />
      </Physics>
    </LabCanvas>
  );
}
