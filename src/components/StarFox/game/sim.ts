import type { Vec3 } from "@utils/fieldLayout";

/**
 * Per-frame mutable state shared between the combat systems. Lives in a ref
 * on the game context and is only touched inside `useFrame`.
 */

export type Laser = {
  active: boolean;
  /** Current position; `prevZ` is where it was last frame, for swept hit tests. */
  position: Vec3;
  prevZ: number;
  /** Lateral drift (world units / s) so wingtip bolts converge ahead of the ship. */
  vx: number;
};

/** A request for the particle system: one explosion at a point. */
export type Burst = {
  position: Vec3;
  color: string;
};

export type Sim = {
  lasers: Laser[];
  /** Drained by `Explosions` every frame. */
  bursts: Burst[];
};

export const LASER_POOL = 24;

export function createSim(): Sim {
  return {
    lasers: Array.from({ length: LASER_POOL }, () => ({ active: false, position: [0, 0, 0], prevZ: 0, vx: 0 })),
    bursts: [],
  };
}
