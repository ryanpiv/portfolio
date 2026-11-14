/**
 * Pure barrel-roll timing shared by both ships. A roll is one full turn
 * about the ship's forward axis, eased so it snaps in and settles out.
 */

export const ROLL_DURATION = 0.55;

export type RollDirection = -1 | 1;

export type Roll = {
  /** +1 rolls right (clockwise from behind), −1 rolls left. */
  dir: RollDirection;
  /** Seconds elapsed. */
  t: number;
};

export function startRoll(dir: RollDirection): Roll {
  return { dir, t: 0 };
}

/** Advances the roll; returns null once it has finished. */
export function stepRoll(roll: Roll | null, delta: number): Roll | null {
  if (!roll) return null;
  const t = roll.t + delta;
  return t >= ROLL_DURATION ? null : { dir: roll.dir, t };
}

/** Extra z-rotation (rad) to add to the ship's bank this frame. */
export function rollAngle(roll: Roll | null): number {
  if (!roll) return 0;
  const p = roll.t / ROLL_DURATION;
  const eased = p * p * (3 - 2 * p);
  // Banking right is a negative z rotation, so a right roll spins negative too.
  return -roll.dir * Math.PI * 2 * eased;
}
