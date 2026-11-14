"use client";

import { useMemo } from "react";

import { labLighting, type LabTheme } from "@data/lab";
import type { ProgressStore } from "@utils/progressStore";

import { useStarFoxControls } from "../controls/useStarFoxControls";
import type { InputRef } from "../hooks/useInput";
import { gameLighting, SceneFrame } from "../SceneFrame";
import { GameRun } from "./GameRun";
import type { GameStore } from "./gameStore";

export type RailSceneProps = {
  theme: LabTheme;
  inputRef: InputRef;
  store: GameStore;
  progress: ProgressStore;
  /** Bump to start a fresh attempt. */
  runId: number;
};

/** The rail-mode WebGL scene. Loaded client-only via `next/dynamic` from `StarFox`. */
export default function RailScene({ theme, inputRef, store, progress, runId }: RailSceneProps) {
  const config = useStarFoxControls();
  const lighting = useMemo(() => gameLighting(labLighting[theme]), [theme]);

  return (
    <SceneFrame
      lighting={lighting}
      fog={{ near: config.world.fogNear, far: config.world.fogFar }}
      camera={{ position: config.camera.offset, fov: config.camera.fov }}
    >
      <GameRun key={runId} config={config} lighting={lighting} inputRef={inputRef} store={store} progress={progress} />
    </SceneFrame>
  );
}
