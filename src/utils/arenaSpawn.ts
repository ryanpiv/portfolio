import { pointInAabb, type Aabb } from "./collision";
import type { Vec3 } from "./fieldLayout";

/**
 * Where things can safely appear in the free-roam arena: respawning ships,
 * pickups. Pure functions over the tower boxes so the scene stays dumb and
 * the rules are testable.
 */

export type SpawnBounds = {
  /** Playable radius on the ground plane. */
  radius: number;
  minAltitude: number;
  maxAltitude: number;
};

/** Is `point` at least `clearance` from every box (and not inside one)? */
export function isClear(point: Vec3, boxes: ReadonlyArray<Aabb>, clearance: number): boolean {
  return boxes.every((box) => !pointInAabb(point, box, clearance));
}

function clampToBounds(point: Vec3, bounds: SpawnBounds): Vec3 {
  const r = Math.hypot(point[0], point[2]);
  const scale = r > bounds.radius ? bounds.radius / r : 1;
  return [
    point[0] * scale,
    Math.min(bounds.maxAltitude, Math.max(bounds.minAltitude, point[1])),
    point[2] * scale,
  ];
}

/** Candidate offsets on a ring: a rough circle of `count` points at `radius`, plus up and down. */
function ring(radius: number, count: number): Vec3[] {
  const out: Vec3[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    out.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
  }
  out.push([0, radius, 0], [0, -radius, 0]);
  return out;
}

/** Search step and limit for `findClearPoint`. */
const SEARCH_STEP = 8;
const SEARCH_RINGS = 12;
const RING_POINTS = 12;

/**
 * The nearest clear point to `origin`: the origin itself when it is clear,
 * otherwise the first clear candidate on rings of growing radius. Falls back
 * to the arena center at mid altitude.
 */
export function findClearPoint(
  origin: Vec3,
  boxes: ReadonlyArray<Aabb>,
  clearance: number,
  bounds: SpawnBounds,
): Vec3 {
  const start = clampToBounds(origin, bounds);
  if (isClear(start, boxes, clearance)) return start;
  for (let i = 1; i <= SEARCH_RINGS; i++) {
    for (const offset of ring(i * SEARCH_STEP, RING_POINTS)) {
      const candidate = clampToBounds([start[0] + offset[0], start[1] + offset[1], start[2] + offset[2]], bounds);
      if (isClear(candidate, boxes, clearance)) return candidate;
    }
  }
  return [0, (bounds.minAltitude + bounds.maxAltitude) / 2, 0];
}

/** Pick a random clear point inside the bounds; `fallback` after `tries` misses. */
export function randomClearPoint(
  rng: () => number,
  boxes: ReadonlyArray<Aabb>,
  clearance: number,
  bounds: SpawnBounds,
  tries = 24,
): Vec3 {
  for (let i = 0; i < tries; i++) {
    const angle = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * bounds.radius;
    const candidate: Vec3 = [
      Math.cos(angle) * r,
      bounds.minAltitude + rng() * (bounds.maxAltitude - bounds.minAltitude),
      Math.sin(angle) * r,
    ];
    if (isClear(candidate, boxes, clearance)) return candidate;
  }
  return findClearPoint([0, (bounds.minAltitude + bounds.maxAltitude) / 2, 0], boxes, clearance, bounds);
}

/** How far ahead a respawning ship needs to see open air to keep its heading. */
const LOOKAHEAD = 45;
const LOOKAHEAD_SAMPLES = 6;

/**
 * Heading for a respawn: keep `yaw` if the next stretch ahead is open,
 * otherwise face the arena center. `yaw` follows the ship convention (nose
 * along −z at 0, +yaw swings the nose toward −x).
 */
export function respawnYaw(point: Vec3, yaw: number, boxes: ReadonlyArray<Aabb>, clearance: number): number {
  const dx = -Math.sin(yaw);
  const dz = -Math.cos(yaw);
  for (let i = 1; i <= LOOKAHEAD_SAMPLES; i++) {
    const t = (i / LOOKAHEAD_SAMPLES) * LOOKAHEAD;
    const sample: Vec3 = [point[0] + dx * t, point[1], point[2] + dz * t];
    if (!isClear(sample, boxes, clearance)) return Math.atan2(point[0], point[2]);
  }
  return yaw;
}
