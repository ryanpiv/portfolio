"use client";

import { useMemo, useRef } from "react";
import type * as THREE from "three";

import { weapons, type CombatConfig, type EffectSettings, type LightingPreset, type RoamConfig } from "@data/lab";
import { projects } from "@data/projects";
import { layoutArena } from "@utils/arenaLayout";
import type { ProgressStore } from "@utils/progressStore";

import { EnemyShots } from "../combat/EnemyShots";
import { Explosions } from "../combat/Explosions";
import { FlashLights } from "../combat/FlashLights";
import { Lasers } from "../combat/Lasers";
import { GameContext, type GameContextValue } from "../gameContext";
import { createSim } from "../game/sim";
import { useAfterFirstFrame } from "../hooks/useAfterFirstFrame";
import type { InputRef } from "../hooks/useInput";
import { Arena } from "./Arena";
import { createArenaState } from "./arenaState";
import { Portals } from "./Portals";
import { PowerUps } from "./PowerUps";
import type { RadarRef } from "./radarFrame";
import { RoamCamera } from "./RoamCamera";
import { RoamContext, type RoamContextValue } from "./roamContext";
import { Roamers } from "./Roamers";
import { RoamShip } from "./RoamShip";
import { ShipLight } from "./ShipLight";
import { damageHull, isRoamLive, type RoamStore } from "./roamStore";

type RoamRunProps = {
  config: RoamConfig;
  combat: CombatConfig;
  lighting: LightingPreset;
  effects: EffectSettings;
  inputRef: InputRef;
  store: RoamStore;
  progress: ProgressStore;
  radarRef: RadarRef;
};

/** One free-roam session: arena, portals, pickups, ship, roamers, and the shared combat systems. */
export function RoamRun({ config, combat, lighting, effects, inputRef, store, progress, radarRef }: RoamRunProps) {
  const shipRef = useRef<THREE.Group | null>(null);
  const simRef = useRef(createSim());
  const weaponRef = useRef(weapons[store.get().weapon]);
  const { seed, radius, buildingCount, treeCount } = config.arena;
  const layout = useMemo(
    () => layoutArena({ seed, radius, buildingCount, treeCount, projects }),
    [seed, radius, buildingCount, treeCount],
  );
  const arenaRef = useRef(createArenaState(layout, config.towers.healthPerMetre));

  const game = useMemo<GameContextValue>(
    () => ({
      lighting,
      effects,
      combat,
      shipRef,
      inputRef,
      simRef,
      weaponRef,
      progress,
      scrollSpeed: 0,
      isLive: () => isRoamLive(store.get()),
      damageShip: (amount) => damageHull(store, amount),
    }),
    [lighting, effects, combat, inputRef, progress, store],
  );
  const roam = useMemo<RoamContextValue>(
    () => ({ config, store, layout, arenaRef, radarRef }),
    [config, store, layout, radarRef],
  );

  // Portals, roamers, and pickups carry DOM nameplates; mount them once the loop is running.
  const populated = useAfterFirstFrame();

  return (
    <GameContext.Provider value={game}>
      <RoamContext.Provider value={roam}>
        <Arena />
        {/* Sibling order is update order: ship moves, portals test its path, bolts fire, towers and roamers test against bolts, debris spawns. */}
        <RoamShip />
        {populated && <Portals />}
        <Lasers />
        {populated && <Roamers />}
        {populated && <PowerUps />}
        <EnemyShots />
        <Explosions />
        <FlashLights />
        <ShipLight />
        <RoamCamera />
      </RoamContext.Provider>
    </GameContext.Provider>
  );
}
