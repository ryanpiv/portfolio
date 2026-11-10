"use client";

import { useMemo } from "react";
import { button, useControls } from "leva";

import { labLighting, type FieldViewOptions, type LabTheme, type LabVariant } from "@data/lab";

import type { FieldSettings } from "../fieldContext";
import { constraintDepth, constraintSchema, mergeConstraint } from "./constraintControls";
import { applyLighting, lightingSchema } from "./lightingControls";
import { slider } from "./schema";

type UseFieldControlsArgs = {
  variant: LabVariant;
  theme: LabTheme;
  /** Visitor-facing options owned by the HUD; merged in, not tunable here. */
  view: FieldViewOptions;
  onReset: () => void;
};

/**
 * Leva panel wired to the active variant + theme. Controls re-seed from the
 * presets whenever either changes; tuned values are meant to be copied back
 * into `src/data/lab/`.
 */
export function useFieldControls({ variant, theme, view, onReset }: UseFieldControlsArgs): {
  settings: FieldSettings;
  paused: boolean;
} {
  const preset = labLighting[theme];
  const deps = [variant.id, theme];

  const scene = useControls(
    "Scene",
    {
      paused: false,
      halfDepth: slider(constraintDepth(variant.constraint) / 2, 0.5, 8, 0.25),
      reset: button(() => onReset()),
    },
    deps,
  );

  const physics = useControls(
    "Physics",
    {
      linearDamping: slider(variant.physics.linearDamping, 0, 2, 0.01),
      restitution: slider(variant.physics.restitution, 0, 1, 0.01),
      hoverBrake: slider(variant.physics.hoverBrake, 0.5, 1, 0.005),
      followGain: slider(variant.physics.followGain, 2, 40, 0.5),
      maxSpeed: slider(variant.physics.maxSpeed, 2, 60, 1),
    },
    deps,
  );

  const constraint = useControls("Constraint", constraintSchema(variant.constraint), deps) as Record<
    string,
    unknown
  >;

  const lighting = useControls("Lighting", lightingSchema(preset), deps);

  const settings = useMemo<FieldSettings>(
    () => ({
      constraint: mergeConstraint(variant.constraint, constraint),
      physics: { ...variant.physics, ...physics },
      lighting: applyLighting(preset, lighting),
      halfDepth: scene.halfDepth,
      view,
    }),
    [preset, lighting, variant, constraint, physics, scene.halfDepth, view],
  );

  return { settings, paused: scene.paused };
}
