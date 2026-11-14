import type { Formation, WaveSpec } from "@data/lab";

import type { Vec3 } from "./fieldLayout";

/**
 * Pure formation math for the arcade lab. Offsets are relative to the
 * wave's anchor; +x right, +y up, +z toward the player (so negative z
 * trails behind the leader). No three.js so it stays unit-testable.
 */

/** Wall rows alternate above/below the anchor by this fraction of the spacing. */
const WALL_ROW_LIFT = 0.8;
/** Column fighters zigzag vertically by this fraction of the spacing. */
const COLUMN_ZIGZAG = 0.35;
/** How far each vee wingman trails its inboard neighbour, as a fraction of the spacing. */
const VEE_TRAIL = 0.8;

/** Index positions centred on zero: n=3 → −1, 0, 1. */
function centred(index: number, count: number): number {
  return index - (count - 1) / 2;
}

export function formationOffsets(formation: Formation, count: number, spacing: number): Vec3[] {
  return Array.from({ length: count }, (_, i) => {
    const c = centred(i, count);
    const alternate = i % 2 === 0 ? 1 : -1;
    switch (formation) {
      case "line":
        return vec(c * spacing, 0, 0);
      case "vee":
        return vec(c * spacing, 0, -Math.abs(c) * spacing * VEE_TRAIL);
      case "column":
        return vec(0, alternate * spacing * COLUMN_ZIGZAG, -i * spacing);
      case "wall":
        return vec(c * spacing, alternate * spacing * WALL_ROW_LIFT * 0.5, 0);
    }
  });
}

/** Builds a Vec3 with `-0` normalised so offsets compare cleanly. */
function vec(x: number, y: number, z: number): Vec3 {
  return [x + 0, y + 0, z + 0];
}

/**
 * Deals items into waves in order, wrapping around if the table asks for
 * more than exist. Empty input yields empty waves.
 */
export function dealIntoWaves<T>(items: readonly T[], waves: readonly WaveSpec[]): T[][] {
  let cursor = 0;
  return waves.map((wave) =>
    Array.from({ length: wave.count }, () => {
      const item = items[cursor % items.length];
      cursor++;
      return item;
    }).filter((item): item is T => item !== undefined),
  );
}

/** Total enemies across a wave table. */
export function totalEnemies(waves: readonly WaveSpec[]): number {
  return waves.reduce((sum, wave) => sum + wave.count, 0);
}
