import type { WaveSpec } from "@data/lab";
import { createStore, type Store } from "@utils/createStore";
import { totalEnemies } from "@utils/waveLayout";

/**
 * Low-frequency game state the DOM HUD reads: phase, wave number, score,
 * shield. The scene publishes on events (spawn, hit, damage), never per
 * frame.
 */

export type GamePhase = "briefing" | "wave" | "complete" | "failed";

export type GameState = {
  phase: GamePhase;
  /** Zero-based index of the current (or last) wave. */
  wave: number;
  waveCount: number;
  hits: number;
  escaped: number;
  /** Enemies in the whole run. */
  total: number;
  /** Shield points left; the run fails at zero. */
  shield: number;
  shieldMax: number;
  /** Slugs of the projects shot down, in order. */
  downed: string[];
};

export type GameStore = Store<GameState>;

export type GameRules = {
  waves: readonly WaveSpec[];
  shieldMax: number;
};

export function initialGameState({ waves, shieldMax }: GameRules): GameState {
  return {
    phase: "briefing",
    wave: 0,
    waveCount: waves.length,
    hits: 0,
    escaped: 0,
    total: totalEnemies(waves),
    shield: shieldMax,
    shieldMax,
    downed: [],
  };
}

export function createGameStore(rules: GameRules): GameStore {
  return createStore<GameState>(initialGameState(rules));
}

/** Is the run still being played (as opposed to won or lost)? */
export function isRunLive(phase: GamePhase): boolean {
  return phase === "briefing" || phase === "wave";
}

/** Takes shield off the player; flips the run to `failed` when it runs out. Ignored once the run is over. */
export function applyDamage(store: GameStore, amount: number): void {
  store.set((state) => {
    if (!isRunLive(state.phase)) return {};
    const shield = Math.max(0, state.shield - amount);
    return { shield, phase: shield === 0 ? "failed" : state.phase };
  });
}

/** Records a shot-down fighter. */
export function recordHit(store: GameStore, slug: string): void {
  store.set((state) => ({ hits: state.hits + 1, downed: [...state.downed, slug] }));
}

export function recordEscape(store: GameStore): void {
  store.set((state) => ({ escaped: state.escaped + 1 }));
}
