import type { WaveSpec } from "@data/lab";
import { createStore, type Store } from "@utils/createStore";
import { totalEnemies } from "@utils/waveLayout";

/**
 * Low-frequency game state the DOM HUD reads: phase, wave number, score.
 * The scene publishes on events (spawn, hit, escape), never per frame.
 */

export type GamePhase = "briefing" | "wave" | "complete";

export type GameState = {
  phase: GamePhase;
  /** Zero-based index of the current (or last) wave. */
  wave: number;
  waveCount: number;
  hits: number;
  escaped: number;
  /** Enemies in the whole run. */
  total: number;
};

export type GameStore = Store<GameState>;

export function createGameStore(waves: readonly WaveSpec[]): GameStore {
  return createStore<GameState>({
    phase: "briefing",
    wave: 0,
    waveCount: waves.length,
    hits: 0,
    escaped: 0,
    total: totalEnemies(waves),
  });
}
