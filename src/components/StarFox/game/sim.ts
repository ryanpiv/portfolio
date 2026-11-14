import type { Vec3 } from "@utils/fieldLayout";

/**
 * Per-frame mutable state shared between the combat systems. Lives in a ref
 * on the game context and is only touched inside `useGameFrame`.
 */

export type Laser = {
  active: boolean;
  /** Current position; `prevZ` is where it was last frame, for swept hit tests. */
  position: Vec3;
  prevZ: number;
  /** Lateral drift (world units / s) so wingtip bolts converge ahead of the ship. */
  vx: number;
};

/** An enemy shot: a slow ball aimed at where the ship was when it fired. */
export type Shot = {
  active: boolean;
  position: Vec3;
  velocity: Vec3;
};

/** A request for the particle system: one explosion at a point. */
export type Burst = {
  position: Vec3;
  color: string;
  /** Debris count multiplier; 1 = a fighter. */
  size?: number;
};

export type Sim = {
  lasers: Laser[];
  shots: Shot[];
  /** Drained by `Explosions` every frame. */
  bursts: Burst[];
};

export const LASER_POOL = 24;
export const SHOT_POOL = 32;

export function createSim(): Sim {
  return {
    lasers: Array.from({ length: LASER_POOL }, () => ({ active: false, position: [0, 0, 0], prevZ: 0, vx: 0 })),
    shots: Array.from({ length: SHOT_POOL }, () => ({ active: false, position: [0, 0, 0], velocity: [0, 0, 0] })),
    bursts: [],
  };
}
