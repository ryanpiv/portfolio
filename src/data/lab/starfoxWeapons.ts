import type { ProjectStatus } from "@data/projects";

/**
 * Weapons and the power-ups that grant them. Both game modes fire through
 * the same `Lasers` system; a weapon scales the shared combat tuning and
 * decides what a bolt can hurt. Free roam hands them out as pickups and
 * takes them back when you die.
 */

export type WeaponId = "twin" | "spread" | "hyper" | "plasma";

export type WeaponSpec = {
  id: WeaponId;
  title: string;
  /** Multipliers on `combat.fireRate` / `combat.laserSpeed`. */
  fireRateScale: number;
  speedScale: number;
  /** Health taken from a fighter per bolt. */
  damage: number;
  /** Bolts per trigger pull and the total fan angle (rad) they spread across. */
  bolts: number;
  spreadAngle: number;
  /** Bolt thickness multiplier on the base. */
  size: number;
  /** Can this bolt damage towers? */
  heavy: boolean;
  /** Status color the bolt borrows from the lighting preset. */
  color: ProjectStatus;
};

export const weapons: Record<WeaponId, WeaponSpec> = {
  twin: {
    id: "twin",
    title: "Twin laser",
    fireRateScale: 1,
    speedScale: 1,
    damage: 100,
    bolts: 1,
    spreadAngle: 0,
    size: 1,
    heavy: false,
    color: "live",
  },
  spread: {
    id: "spread",
    title: "Spread shot",
    fireRateScale: 0.8,
    speedScale: 0.9,
    damage: 50,
    bolts: 3,
    spreadAngle: 0.28,
    size: 1,
    heavy: false,
    color: "in-progress",
  },
  hyper: {
    id: "hyper",
    title: "Hyper laser",
    fireRateScale: 2.2,
    speedScale: 1.4,
    damage: 60,
    bolts: 1,
    spreadAngle: 0,
    size: 0.8,
    heavy: false,
    color: "showcase",
  },
  plasma: {
    id: "plasma",
    title: "Plasma cannon",
    fireRateScale: 0.45,
    speedScale: 0.7,
    damage: 250,
    bolts: 1,
    spreadAngle: 0,
    size: 2.6,
    heavy: true,
    color: "rewrite-planned",
  },
};

export const DEFAULT_WEAPON: WeaponId = "twin";

export type PowerUpKind = "weapon" | "repair";

export type PowerUpSpec = {
  id: string;
  title: string;
  kind: PowerUpKind;
  /** For `weapon` pickups. */
  weapon?: WeaponId;
  color: ProjectStatus;
};

/** What floats around the arena. Repair pickups are plain and common; weapons are the prizes. */
export const powerUps: readonly PowerUpSpec[] = [
  { id: "repair", title: "Repair", kind: "repair", color: "live" },
  { id: "spread", title: "Spread shot", kind: "weapon", weapon: "spread", color: "in-progress" },
  { id: "hyper", title: "Hyper laser", kind: "weapon", weapon: "hyper", color: "showcase" },
  { id: "plasma", title: "Plasma cannon", kind: "weapon", weapon: "plasma", color: "rewrite-planned" },
];
