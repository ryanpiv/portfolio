import type { Vec3 } from "./fieldLayout";

/** Pure sphere tests for the lab games. Squared distances; no sqrt. */

function distanceSq(a: Vec3, b: Vec3): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

export function spheresOverlap(a: Vec3, ra: number, b: Vec3, rb: number): boolean {
  return distanceSq(a, b) <= (ra + rb) ** 2;
}

/**
 * Whether the segment from `start` to `end` passes within `radius` of
 * `center`. Use this for fast projectiles so they cannot tunnel through a
 * target between frames.
 */
export function segmentHitsSphere(start: Vec3, end: Vec3, center: Vec3, radius: number): boolean {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const dz = end[2] - start[2];
  const lengthSq = dx * dx + dy * dy + dz * dz;

  // Degenerate segment: a point test.
  if (lengthSq === 0) return distanceSq(start, center) <= radius * radius;

  // Project the center onto the segment and clamp to its ends.
  const t = Math.max(
    0,
    Math.min(1, ((center[0] - start[0]) * dx + (center[1] - start[1]) * dy + (center[2] - start[2]) * dz) / lengthSq),
  );
  const closest: Vec3 = [start[0] + dx * t, start[1] + dy * t, start[2] + dz * t];
  return distanceSq(closest, center) <= radius * radius;
}
