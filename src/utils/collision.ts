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

/** Axis-aligned box as min/max corners. */
export type Aabb = { min: Vec3; max: Vec3 };

/**
 * Push a sphere out of a box along the axis of least penetration. Returns
 * the corrected center, or `null` when they do not overlap. Mutation-free so
 * callers can decide what to do with the result (stop, slide, bounce).
 */
export function resolveSphereAabb(center: Vec3, radius: number, box: Aabb): Vec3 | null {
  const closest: Vec3 = [
    Math.max(box.min[0], Math.min(center[0], box.max[0])),
    Math.max(box.min[1], Math.min(center[1], box.max[1])),
    Math.max(box.min[2], Math.min(center[2], box.max[2])),
  ];
  const dSq = distanceSq(center, closest);
  if (dSq > radius * radius) return null;

  if (dSq > 0) {
    // Center outside the box: push straight away from the closest surface point.
    const d = Math.sqrt(dSq);
    const scale = radius / d;
    return [
      closest[0] + (center[0] - closest[0]) * scale,
      closest[1] + (center[1] - closest[1]) * scale,
      closest[2] + (center[2] - closest[2]) * scale,
    ];
  }

  // Center inside the box: exit through the nearest face.
  let bestAxis = 0;
  let bestDepth = Infinity;
  let bestSign = 1;
  for (let axis = 0; axis < 3; axis++) {
    const toMax = box.max[axis] - center[axis];
    const toMin = center[axis] - box.min[axis];
    if (toMax < bestDepth) {
      bestDepth = toMax;
      bestAxis = axis;
      bestSign = 1;
    }
    if (toMin < bestDepth) {
      bestDepth = toMin;
      bestAxis = axis;
      bestSign = -1;
    }
  }
  const out: Vec3 = [...center];
  out[bestAxis] = bestSign > 0 ? box.max[bestAxis] + radius : box.min[bestAxis] - radius;
  return out;
}

/**
 * Whether the segment from `start` to `end` passes through a box (slab
 * test). Returns the entry point, or `null` on a miss. For bolts against
 * towers.
 */
export function segmentHitsAabb(start: Vec3, end: Vec3, box: Aabb): Vec3 | null {
  let tMin = 0;
  let tMax = 1;
  for (let axis = 0; axis < 3; axis++) {
    const d = end[axis] - start[axis];
    if (Math.abs(d) < 1e-9) {
      if (start[axis] < box.min[axis] || start[axis] > box.max[axis]) return null;
      continue;
    }
    let t0 = (box.min[axis] - start[axis]) / d;
    let t1 = (box.max[axis] - start[axis]) / d;
    if (t0 > t1) [t0, t1] = [t1, t0];
    tMin = Math.max(tMin, t0);
    tMax = Math.min(tMax, t1);
    if (tMin > tMax) return null;
  }
  return [
    start[0] + (end[0] - start[0]) * tMin,
    start[1] + (end[1] - start[1]) * tMin,
    start[2] + (end[2] - start[2]) * tMin,
  ];
}

/** Whether a point lies inside a box, grown by `margin` on every side. */
export function pointInAabb(point: Vec3, box: Aabb, margin = 0): boolean {
  return (
    point[0] >= box.min[0] - margin &&
    point[0] <= box.max[0] + margin &&
    point[1] >= box.min[1] - margin &&
    point[1] <= box.max[1] + margin &&
    point[2] >= box.min[2] - margin &&
    point[2] <= box.max[2] + margin
  );
}

/**
 * Whether the segment from `start` to `end` crosses a disc: the circle of
 * `radius` around `center` lying in the plane with unit `normal`. Used for
 * flying through portal rings without tunnelling at speed.
 */
export function segmentCrossesDisc(start: Vec3, end: Vec3, center: Vec3, normal: Vec3, radius: number): boolean {
  const d0 = dot(sub(start, center), normal);
  const d1 = dot(sub(end, center), normal);
  // Both ends on the same side (or touching without crossing): no pass-through.
  if ((d0 > 0 && d1 > 0) || (d0 < 0 && d1 < 0) || d0 === d1) return false;
  const t = d0 / (d0 - d1);
  const hit: Vec3 = [
    start[0] + (end[0] - start[0]) * t,
    start[1] + (end[1] - start[1]) * t,
    start[2] + (end[2] - start[2]) * t,
  ];
  return distanceSq(hit, center) <= radius * radius;
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
