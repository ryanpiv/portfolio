import type { WeaponId } from "@data/lab";
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
  /** Health taken from whatever it hits. */
  damage: number;
  /** Heavy bolts also damage towers. */
  heavy: boolean;
  /** Bolt thickness multiplier and the weapon that fired it (for its color). */
  size: number;
  weapon: WeaponId;
};

/** An enemy shot: a slow ball aimed at where the ship was when it fired. */
export type Shot = {
  active: boolean;
  position: Vec3;
  velocity: Vec3;
  /** Seconds alive; shots expire after `SHOT_LIFE`. */
  age: number;
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

export const LASER_POOL = 48;
export const SHOT_POOL = 32;
/** Enemy shots are dropped after this long: well past the camera in rail, well past the ship in roam. */
export const SHOT_LIFE = 5;

export function createSim(): Sim {
  return {
    lasers: Array.from({ length: LASER_POOL }, () => ({
      active: false,
      position: [0, 0, 0],
      prev: [0, 0, 0],
      velocity: [0, 0, 0],
      travelled: 0,
      damage: 0,
      heavy: false,
      size: 1,
      weapon: "twin",
    })),
    shots: Array.from({ length: SHOT_POOL }, () => ({
      active: false,
      position: [0, 0, 0],
      velocity: [0, 0, 0],
      age: 0,
    })),
    bursts: [],
  };
}
