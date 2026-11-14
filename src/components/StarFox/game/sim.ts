import type { Vec3 } from "@utils/fieldLayout";

/**
 * Per-frame mutable state shared between the combat systems. Lives in a ref
 * on the game context and is only touched inside `useGameFrame`.
 */

export type Laser = {
  active: boolean;
  /** Tip position now and last frame, for swept hit tests. */
  position: Vec3;
  prev: Vec3;
  velocity: Vec3;
  /** Distance covered; bolts despawn past `combat.laserRange`. */
  travelled: number;
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
    lasers: Array.from({ length: LASER_POOL }, () => ({
      active: false,
      position: [0, 0, 0],
      prev: [0, 0, 0],
      velocity: [0, 0, 0],
      travelled: 0,
    })),
    shots: Array.from({ length: SHOT_POOL }, () => ({ active: false, position: [0, 0, 0], velocity: [0, 0, 0] })),
    bursts: [],
  };
}
