/**
 * Wave table for the Star Fox lab. Enemies are dealt from the project
 * registry in order, so the counts here should sum to the number of
 * projects — every project shows up exactly once per run.
 */

export type Formation = "line" | "vee" | "column" | "wall";

export type WaveSpec = {
  count: number;
  formation: Formation;
  /** Gap between neighbours in the formation, world units. */
  spacing: number;
  /** Closing speed on top of the world scroll, world units / s. */
  approach: number;
  /** Lateral sway: amplitude in world units, frequency in rad / s. */
  weave: { amplitude: number; frequency: number };
};

export type WaveTiming = {
  /** Seconds of empty flying before wave 1. */
  briefing: number;
  /** Seconds between a wave clearing and the next spawning. */
  between: number;
};

export const starFoxWaveTiming: WaveTiming = {
  briefing: 2.5,
  between: 1.5,
};

export const starFoxWaves: readonly WaveSpec[] = [
  { count: 3, formation: "line", spacing: 5, approach: 8, weave: { amplitude: 1.5, frequency: 1.2 } },
  { count: 4, formation: "vee", spacing: 4, approach: 12, weave: { amplitude: 2, frequency: 1.6 } },
  { count: 4, formation: "column", spacing: 7, approach: 18, weave: { amplitude: 4.5, frequency: 1 } },
  { count: 5, formation: "wall", spacing: 4.5, approach: 22, weave: { amplitude: 1, frequency: 2.2 } },
];
