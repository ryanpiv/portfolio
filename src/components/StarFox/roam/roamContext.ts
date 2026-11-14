import { createContext, useContext } from "react";

import type { RoamConfig } from "@data/lab";
import type { ArenaLayout } from "@utils/arenaLayout";

import { useGame, type GameContextValue } from "../gameContext";
import type { RadarRef } from "./radarFrame";
import type { RoamStore } from "./roamStore";

export type RoamContextValue = {
  config: RoamConfig;
  store: RoamStore;
  layout: ArenaLayout;
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
