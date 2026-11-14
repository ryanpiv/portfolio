import type { WaveTiming } from "@data/lab";

/**
 * Pure wave sequencer. `Enemies` steps it every frame and acts on the
 * returned `spawn` index. Framework-free so it can be unit-tested.
 *
 *   briefing ──(timer)──► wave ──(cleared)──► between ──(timer)──► wave …
 *                                      └──(last wave cleared)──► complete
 */

export type DirectorPhase = "briefing" | "wave" | "between" | "complete";

export type DirectorState = {
  phase: DirectorPhase;
  /** Index of the current wave; during `between` it is the wave that just cleared. */
  wave: number;
  /** Seconds spent in the current phase. */
  timer: number;
};

export type DirectorStep = {
  state: DirectorState;
  /** Set when a wave should spawn this frame. */
  spawn?: number;
};

export function createDirector(): DirectorState {
  return { phase: "briefing", wave: 0, timer: 0 };
}

export function stepDirector(
  state: DirectorState,
  delta: number,
  /** Whether any enemy from the current wave is still in play. */
  waveActive: boolean,
  timing: WaveTiming,
  waveCount: number,
): DirectorStep {
  const timer = state.timer + delta;

  switch (state.phase) {
    case "briefing":
      if (waveCount === 0) return { state: { phase: "complete", wave: 0, timer: 0 } };
      if (timer < timing.briefing) return { state: { ...state, timer } };
      return { state: { phase: "wave", wave: 0, timer: 0 }, spawn: 0 };

    case "wave":
      if (waveActive) return { state: { ...state, timer } };
      if (state.wave + 1 >= waveCount) return { state: { phase: "complete", wave: state.wave, timer: 0 } };
      return { state: { phase: "between", wave: state.wave, timer: 0 } };

    case "between": {
      if (timer < timing.between) return { state: { ...state, timer } };
      const next = state.wave + 1;
      return { state: { phase: "wave", wave: next, timer: 0 }, spawn: next };
    }

    case "complete":
      return { state };
  }
}
