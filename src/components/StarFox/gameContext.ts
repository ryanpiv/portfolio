import { createContext, useContext, type RefObject } from "react";
import type * as THREE from "three";

import type { CombatConfig, LightingPreset } from "@data/lab";
import type { ProgressStore } from "@utils/progressStore";

import type { Sim } from "./game/sim";
import type { InputRef } from "./hooks/useInput";

/**
 * What every mode provides to the shared systems (ship model, lasers,
 * explosions). Mode-specific state hangs off a second context (`rail/`,
 * `roam/`).
 */
export type GameContextValue = {
  lighting: LightingPreset;
  combat: CombatConfig;
  /** The player's ship group. `userData.aim` (quaternion) is where it is pointing; `userData.rolling` while barrel-rolling. */
  shipRef: RefObject<THREE.Group | null>;
  inputRef: InputRef;
  /** Per-frame mutable state shared by the combat systems. */
  simRef: RefObject<Sim>;
  /** Lifetime stats and achievements, shared across modes. */
  progress: ProgressStore;
  /** Forward streaming speed of the world; debris inherits it (0 in free roam). */
  scrollSpeed: number;
  /** Whether the player may act right now (not dead, not mid-transition). */
  isLive: () => boolean;
};

export const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error("useGame must be used inside <GameContext.Provider>");
  return value;
}
