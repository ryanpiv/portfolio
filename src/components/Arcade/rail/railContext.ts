import { createContext, useContext } from "react";

import type { RailConfig } from "@data/lab";

import { useGame, type GameContextValue } from "../gameContext";
import type { GameStore } from "./gameStore";

export type RailContextValue = {
  config: RailConfig;
  /** Low-frequency run state for the HUD. */
  store: GameStore;
};

export const RailContext = createContext<RailContextValue | null>(null);

/** Shared game context plus the rail run's config and store. */
export function useRail(): GameContextValue & RailContextValue {
  const game = useGame();
  const rail = useContext(RailContext);
  if (!rail) throw new Error("useRail must be used inside <RailContext.Provider>");
  return { ...game, ...rail };
}
