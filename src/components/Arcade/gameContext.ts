import { createContext, useContext, type RefObject } from "react";
import type * as THREE from "three";

import type { CombatConfig, EffectSettings, LightingPreset, WeaponSpec } from "@data/lab";
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
  /** The visitor's effect toggles; systems skip what is off. */
  effects: EffectSettings;
  combat: CombatConfig;
  /**
   * The player's ship group. `userData.aim` (quaternion) is where it is
   * pointing; `userData.rolling` while barrel-rolling; `userData.immune`
   * while shots and rams should bounce off.
   */
  shipRef: RefObject<THREE.Group | null>;
  /** The weapon the lasers fire; modes swap it on pickups and deaths. */
  weaponRef: RefObject<WeaponSpec>;
  inputRef: InputRef;
  /** Per-frame mutable state shared by the combat systems. */
  simRef: RefObject<Sim>;
  /** Lifetime stats and achievements, shared across modes. */
  progress: ProgressStore;
  /** Forward streaming speed of the world; debris inherits it (0 in free roam). */
  scrollSpeed: number;
  /** Whether the player may act right now (not dead, not mid-transition). */
  isLive: () => boolean;
  /** Takes health off the player; each mode decides what running out means. */
  damageShip: (amount: number) => void;
};

export const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error("useGame must be used inside <GameContext.Provider>");
  return value;
}
