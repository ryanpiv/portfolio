"use client";

import { useMemo } from "react";

import { labLighting, type LabTheme } from "@data/lab";
import type { ProgressStore } from "@utils/progressStore";

import type { InputRef } from "../hooks/useInput";
import { gameLighting, SceneFrame, type SceneQuality } from "../SceneFrame";
import type { RadarRef } from "./radarFrame";
import { RoamRun } from "./RoamRun";
import type { RoamStore } from "./roamStore";
import { useRoamControls } from "./useRoamControls";

/** Fog starts at this fraction of the arena radius and is solid at the far side. */
const FOG_NEAR_FRACTION = 0.35;
const FOG_FAR_FRACTION = 2.2;

export type RoamSceneProps = SceneQuality & {
  theme: LabTheme;
  inputRef: InputRef;
  store: RoamStore;
  progress: ProgressStore;
  radarRef: RadarRef;
};

/** The free-roam WebGL scene. Loaded client-only via `next/dynamic` from `ArcadeRoam`. */
export default function RoamScene({ quality, onDegrade, theme, inputRef, store, progress, radarRef }: RoamSceneProps) {
  const { config, combat } = useRoamControls();
  const lighting = useMemo(() => gameLighting(labLighting[theme]), [theme]);
  const { radius } = config.arena;

  return (
    <SceneFrame
      quality={quality}
      onDegrade={onDegrade}
      lighting={lighting}
      fog={{ near: radius * FOG_NEAR_FRACTION, far: radius * FOG_FAR_FRACTION }}
      camera={{ position: [0, config.camera.height + 12, config.camera.distance], fov: config.camera.fov }}
    >
      <RoamRun
        config={config}
        combat={combat}
        lighting={lighting}
        inputRef={inputRef}
        store={store}
        progress={progress}
        radarRef={radarRef}
      />
    </SceneFrame>
  );
}
