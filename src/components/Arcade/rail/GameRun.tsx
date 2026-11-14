"use client";

import { useMemo, useRef } from "react";
import type * as THREE from "three";

import { weapons, type EffectSettings, type LightingPreset, type RailConfig } from "@data/lab";
import type { ProgressStore } from "@utils/progressStore";

import { EnemyShots } from "../combat/EnemyShots";
import { Explosions } from "../combat/Explosions";
import { FlashLights } from "../combat/FlashLights";
import { Lasers } from "../combat/Lasers";
import { GameContext, type GameContextValue } from "../gameContext";
import { createSim } from "../game/sim";
import type { InputRef } from "../hooks/useInput";
import { ChaseCamera } from "./ChaseCamera";
import { Enemies } from "./Enemies";
import { applyDamage, isRunLive, type GameStore } from "./gameStore";
import { Ground } from "./Ground";
import { RailContext } from "./railContext";
import { Scenery } from "./Scenery";
import { Ship } from "./Ship";

type GameRunProps = {
  config: RailConfig;
  lighting: LightingPreset;
  effects: EffectSettings;
  inputRef: InputRef;
  store: GameStore;
  progress: ProgressStore;
};

/**
 * Everything that belongs to one attempt. Remount (change its `key`) to
 * start over: the sim pool, ship, waves, and debris all reset together.
 */
export function GameRun({ config, lighting, effects, inputRef, store, progress }: GameRunProps) {
  const shipRef = useRef<THREE.Group | null>(null);
  const simRef = useRef(createSim());
  // Rail mode always flies the twin laser.
  const weaponRef = useRef(weapons.twin);

  const game = useMemo<GameContextValue>(
    () => ({
      lighting,
      effects,
      combat: config.combat,
      shipRef,
      inputRef,
      simRef,
      weaponRef,
      progress,
      scrollSpeed: config.world.scrollSpeed,
      isLive: () => isRunLive(store.get().phase),
      damageShip: (amount) => applyDamage(store, amount),
    }),
    [lighting, effects, config.combat, config.world.scrollSpeed, inputRef, progress, store],
  );
  const rail = useMemo(() => ({ config, store }), [config, store]);

  return (
    <GameContext.Provider value={game}>
      <RailContext.Provider value={rail}>
        <Ground />
        <Scenery key={config.world.sceneryCount} />
        {/* Sibling order is update order: ship moves, bolts fire from it, enemies test against bolts and shoot back, debris spawns. */}
        <Ship />
        <Lasers />
        <Enemies />
        <EnemyShots />
        <Explosions />
        <FlashLights />
        <ChaseCamera />
      </RailContext.Provider>
    </GameContext.Provider>
  );
}
