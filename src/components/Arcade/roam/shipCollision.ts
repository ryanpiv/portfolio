import type { RoamConfig } from "@data/lab";
import { resolveSphereAabb, type Aabb } from "@utils/collision";
import type { Vec3 } from "@utils/fieldLayout";

/**
 * Ship-versus-tower rules for free roam, kept pure so the damage curve and
 * the slide can be tested without three.js.
 */

/**
 * Pushes the ship out of every box it overlaps (mutating `center`) and
 * returns the hit severity: the largest fraction of `heading` (unit vector)
 * that pointed into a wall. 0 means no contact or a parallel graze, 1 a
 * nose-first hit.
 */
export function slideAlongTowers(center: Vec3, radius: number, boxes: Iterable<Aabb>, heading: Vec3): number {
  let severity = 0;
  for (const box of boxes) {
    const pushed = resolveSphereAabb(center, radius, box);
    if (!pushed) continue;
    // The push-out direction is the wall normal.
    const nx = pushed[0] - center[0];
    const ny = pushed[1] - center[1];
    const nz = pushed[2] - center[2];
    const n = Math.hypot(nx, ny, nz) || 1;
    severity = Math.max(severity, -(heading[0] * nx + heading[1] * ny + heading[2] * nz) / n);
    center[0] = pushed[0];
    center[1] = pushed[1];
    center[2] = pushed[2];
  }
  return severity;
}

/** Hull damage for a hit of the given severity; `Infinity` destroys the ship outright. */
export function collisionDamage(severity: number, rules: RoamConfig["collision"]): number {
  if (severity >= rules.fatalAbove) return Infinity;
  if (severity >= rules.heavyAbove) return rules.heavyDamage;
  return rules.lightDamage;
}
