"use client";

import { useMemo } from "react";

import { labLighting, type LabTheme } from "@data/lab";
import type { ProgressStore } from "@utils/progressStore";

import { useRailControls } from "../controls/useRailControls";
import type { InputRef } from "../hooks/useInput";
import { gameLighting, SceneFrame, type SceneQuality } from "../SceneFrame";
import { GameRun } from "./GameRun";
import type { GameStore } from "./gameStore";

export type RailSceneProps = SceneQuality & {
  theme: LabTheme;
  inputRef: InputRef;
  store: GameStore;
  progress: ProgressStore;
  /** Bump to start a fresh attempt. */
  runId: number;
};

/** The rail-mode WebGL scene. Loaded client-only via `next/dynamic` from `Arcade`. */
export default function RailScene({ quality, onDegrade, effects, theme, inputRef, store, progress, runId }: RailSceneProps) {
  const config = useRailControls();
  const lighting = useMemo(() => gameLighting(labLighting[theme]), [theme]);

  return (
    <SceneFrame
      quality={quality}
      onDegrade={onDegrade}
      effects={effects}
      lighting={lighting}
      fog={{ near: config.world.fogNear, far: config.world.fogFar }}
      camera={{ position: config.camera.offset, fov: config.camera.fov }}
    >
      <GameRun
        key={runId}
        config={config}
        lighting={lighting}
        effects={effects}
        inputRef={inputRef}
        store={store}
        progress={progress}
      />
    </SceneFrame>
  );
}
