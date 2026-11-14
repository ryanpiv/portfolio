import type { Vec3 } from "@utils/fieldLayout";

import type { Shot } from "./sim";

/**
 * Launches a pooled shot from `from` toward `target`. The world scroll is
 * added on z so the shot keeps pace with the scenery. Returns false when the
 * pool is exhausted.
 */
export function fireShot(pool: Shot[], from: Vec3, target: Vec3, speed: number, scrollSpeed = 0): boolean {
  const shot = pool.find((s) => !s.active);
  if (!shot) return false;

  const dx = target[0] - from[0];
  const dy = target[1] - from[1];
  const dz = target[2] - from[2];
  const length = Math.hypot(dx, dy, dz) || 1;

  shot.active = true;
  shot.age = 0;
  shot.position = [...from];
  shot.velocity = [(dx / length) * speed, (dy / length) * speed, (dz / length) * speed + scrollSpeed];
  return true;
}
