import { createContext, useContext, type RefObject } from "react";

import type { RoamConfig } from "@data/lab";
import type { ArenaLayout } from "@utils/arenaLayout";

import { useGame, type GameContextValue } from "../gameContext";
import type { ArenaState } from "./arenaState";
import type { RadarRef } from "./radarFrame";
import type { RoamStore } from "./roamStore";

export type RoamContextValue = {
  config: RoamConfig;
  store: RoamStore;
  layout: ArenaLayout;
  /** Towers' health and whether they still stand. */
  arenaRef: RefObject<ArenaState>;
  radarRef: RadarRef;
};

export const RoamContext = createContext<RoamContextValue | null>(null);

/** Shared game context plus the free-roam config, store, and arena. */
export function useRoam(): GameContextValue & RoamContextValue {
  const game = useGame();
  const roam = useContext(RoamContext);
  if (!roam) throw new Error("useRoam must be used inside <RoamContext.Provider>");
  return { ...game, ...roam };
}
