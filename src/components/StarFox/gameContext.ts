import { createContext, useContext, type RefObject } from "react";
import type * as THREE from "three";

import type { LightingPreset, StarFoxConfig } from "@data/lab";

import type { InputRef } from "./hooks/useInput";

export type GameContextValue = {
  config: StarFoxConfig;
  lighting: LightingPreset;
  /** The player's ship group; the camera and (later) enemies read it per frame. */
  shipRef: RefObject<THREE.Group | null>;
  input: InputRef;
};

export const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error("useGame must be used inside <GameContext.Provider>");
  return value;
}
