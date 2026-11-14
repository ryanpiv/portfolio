"use client";

import { useMemo, useRef } from "react";
import type * as THREE from "three";

import type { LightingPreset, StarFoxConfig } from "@data/lab";

import { Enemies } from "./combat/Enemies";
import { EnemyShots } from "./combat/EnemyShots";
import { Explosions } from "./combat/Explosions";
import { Lasers } from "./combat/Lasers";
import { Ship } from "./entities/Ship";
import { GameContext } from "./gameContext";
import type { GameStore } from "./game/gameStore";
import { createSim } from "./game/sim";
import type { InputRef } from "./hooks/useInput";
import { ChaseCamera } from "./world/ChaseCamera";
import { Ground } from "./world/Ground";
import { Scenery } from "./world/Scenery";

type GameRunProps = {
  config: StarFoxConfig;
  lighting: LightingPreset;
  input: InputRef;
  store: GameStore;
};

/**
 * Everything that belongs to one attempt. Remount (change its `key`) to
 * start over: the sim pool, ship, waves, and debris all reset together.
 */
export function GameRun({ config, lighting, input, store }: GameRunProps) {
  const shipRef = useRef<THREE.Group | null>(null);
  const simRef = useRef(createSim());
  const context = useMemo(() => ({ config, lighting, shipRef, input, simRef, store }), [config, lighting, input, store]);

  return (
    <GameContext.Provider value={context}>
      <Ground />
      <Scenery key={config.world.sceneryCount} />
      {/* Sibling order is update order: ship moves, bolts fire from it, enemies test against bolts and shoot back, debris spawns. */}
      <Ship />
      <Lasers />
      <Enemies />
      <EnemyShots />
      <Explosions />
      <ChaseCamera />
    </GameContext.Provider>
  );
}
