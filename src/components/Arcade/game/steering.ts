/** Pure heading helpers shared by the free-roam ship and its roamers. */

/** Wraps an angle into (−π, π]. */
export function wrapAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

/** Steps `current` toward `target` by at most `step`, the short way round. */
export function turnToward(current: number, target: number, step: number): number {
  const diff = wrapAngle(target - current);
  return current + Math.max(-step, Math.min(step, diff));
}

/** Yaw about +y whose local +z points from `from` toward `to` (ground plane only). */
export function yawToward(from: readonly number[], to: readonly number[]): number {
  return Math.atan2(to[0] - from[0], to[2] - from[2]);
}

/** Yaw about +y whose local −z (the ship's nose) points from `from` toward `to`. */
export function noseToward(from: readonly number[], to: readonly number[]): number {
  return Math.atan2(from[0] - to[0], from[2] - to[2]);
}
