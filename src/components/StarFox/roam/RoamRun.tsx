"use client";

import { useMemo, useRef } from "react";
import type * as THREE from "three";

import { type CombatConfig, type LightingPreset, type RoamConfig } from "@data/lab";
import { projects } from "@data/projects";
import { layoutArena } from "@utils/arenaLayout";
import type { ProgressStore } from "@utils/progressStore";

import { Explosions } from "../combat/Explosions";
import { Lasers } from "../combat/Lasers";
import { GameContext, type GameContextValue } from "../gameContext";
import { createSim } from "../game/sim";
import { useAfterFirstFrame } from "../hooks/useAfterFirstFrame";
import type { InputRef } from "../hooks/useInput";
import { Arena } from "./Arena";
import { Portals } from "./Portals";
import type { RadarRef } from "./radarFrame";
import { RoamCamera } from "./RoamCamera";
import { RoamContext, type RoamContextValue } from "./roamContext";
import { Roamers } from "./Roamers";
import { RoamShip } from "./RoamShip";
import { isRoamLive, type RoamStore } from "./roamStore";

type RoamRunProps = {
  config: RoamConfig;
  combat: CombatConfig;
  lighting: LightingPreset;
  inputRef: InputRef;
  store: RoamStore;
  progress: ProgressStore;
  radarRef: RadarRef;
};

/** One free-roam session: arena, portals, ship, roamers, and the shared combat systems. */
export function RoamRun({ config, combat, lighting, inputRef, store, progress, radarRef }: RoamRunProps) {
  const shipRef = useRef<THREE.Group | null>(null);
  const simRef = useRef(createSim());
  const { seed, radius, buildingCount } = config.arena;
  const layout = useMemo(() => layoutArena({ seed, radius, buildingCount, projects }), [seed, radius, buildingCount]);

  const game = useMemo<GameContextValue>(
    () => ({
      lighting,
      combat,
      shipRef,
      inputRef,
      simRef,
      progress,
      scrollSpeed: 0,
      isLive: () => isRoamLive(store.get()),
    }),
    [lighting, combat, inputRef, progress, store],
  );
  // Portals and roamers carry DOM nameplates; mount them once the loop is running.
  const populated = useAfterFirstFrame();
  const roam = useMemo<RoamContextValue>(
    () => ({ config, store, layout, radarRef }),
    [config, store, layout, radarRef],
  );

  return (
    <GameContext.Provider value={game}>
      <RoamContext.Provider value={roam}>
        <Arena />
        {/* Sibling order is update order: ship moves, portals test its path, bolts fire, roamers test against bolts, debris spawns. */}
        <RoamShip />
        {populated && <Portals />}
        <Lasers />
        {populated && <Roamers />}
        <Explosions />
        <RoamCamera />
      </RoamContext.Provider>
    </GameContext.Provider>
  );
}
