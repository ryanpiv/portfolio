import type { Project } from "@data/projects";

import type { Aabb } from "./collision";
import { createRng, type Vec3 } from "./fieldLayout";

/**
 * Deterministic layout for the free-roam arena: a ring of portals (one per
 * project) and a scatter of towers that avoid the portals, the spawn, and
 * each other. Pure, so the scene can `useMemo` it and tests can pin it.
 */

export type Building = {
  /** Footprint center on the ground plane. */
  position: Vec3;
  /** Full extents: width (x), height (y), depth (z). */
  size: Vec3;
  box: Aabb;
};

export type PortalSpot = {
  project: Project;
  /** Ring center. */
  position: Vec3;
  /** Rotation about +y; the ring's normal is the yawed −z axis. */
  yaw: number;
  normal: Vec3;
};

export type ArenaLayout = {
  buildings: Building[];
  portals: PortalSpot[];
};

export type ArenaLayoutOptions = {
  seed: number;
  radius: number;
  buildingCount: number;
  projects: ReadonlyArray<Project>;
};

/** Portals sit on a ring at this fraction of the arena radius. */
export const PORTAL_RING_FRACTION = 0.55;
/** Ring center height. */
export const PORTAL_ALTITUDE = 12;
/** Towers are kept this far from any portal center and from the spawn point. */
const PORTAL_CLEARANCE = 22;
const SPAWN_CLEARANCE = 30;
/** A take-off lane straight ahead of the spawn (−z) is kept clear of towers. */
const LANE_HALF_WIDTH = 16;
const LANE_LENGTH = 120;
/** Portal 0 sits ahead and to the left of the spawn: in view on load, but not on the nose. */
const FIRST_PORTAL_ANGLE = -Math.PI / 2 - Math.PI / 6;
const BUILDING_GAP = 3;
const BUILDING_WIDTH: [number, number] = [6, 16];
const BUILDING_HEIGHT: [number, number] = [8, 48];
/** Towers are placed between these fractions of the radius. */
const BUILDING_BAND: [number, number] = [0.15, 0.95];
/** Give up on a tower after this many rejected placements. */
const MAX_TRIES = 30;

function range(rng: () => number, [lo, hi]: [number, number]): number {
  return lo + rng() * (hi - lo);
}

function distanceXZ(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[2] - b[2]);
}

function boxFor(position: Vec3, size: Vec3): Aabb {
  return {
    min: [position[0] - size[0] / 2, 0, position[2] - size[2] / 2],
    max: [position[0] + size[0] / 2, size[1], position[2] + size[2] / 2],
  };
}

/** Does the footprint cross the take-off lane ahead of the spawn? */
function inSpawnLane(box: Aabb): boolean {
  return box.max[0] > -LANE_HALF_WIDTH && box.min[0] < LANE_HALF_WIDTH && box.min[2] < 0 && box.max[2] > -LANE_LENGTH;
}

function boxesTouch(a: Aabb, b: Aabb, gap: number): boolean {
  return a.min[0] - gap < b.max[0] && a.max[0] + gap > b.min[0] && a.min[2] - gap < b.max[2] && a.max[2] + gap > b.min[2];
}

/** Portals evenly around a ring, each facing the arena center so you fly through toward the middle. */
export function layoutPortals(projects: ReadonlyArray<Project>, radius: number): PortalSpot[] {
  const ringRadius = radius * PORTAL_RING_FRACTION;
  return projects.map((project, i) => {
    const angle = FIRST_PORTAL_ANGLE + (i / projects.length) * Math.PI * 2;
    const position: Vec3 = [Math.cos(angle) * ringRadius, PORTAL_ALTITUDE, Math.sin(angle) * ringRadius];
    // Face the center: the ring's −z should point from the portal toward the origin.
    const yaw = Math.atan2(position[0], position[2]);
    const normal: Vec3 = [-Math.sin(yaw), 0, -Math.cos(yaw)];
    return { project, position, yaw, normal };
  });
}

export function layoutArena({ seed, radius, buildingCount, projects }: ArenaLayoutOptions): ArenaLayout {
  const rng = createRng(seed);
  const portals = layoutPortals(projects, radius);
  const buildings: Building[] = [];
  const spawn: Vec3 = [0, 0, 0];

  for (let i = 0; i < buildingCount; i++) {
    for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
      const angle = rng() * Math.PI * 2;
      const distance = radius * range(rng, BUILDING_BAND);
      const position: Vec3 = [Math.cos(angle) * distance, 0, Math.sin(angle) * distance];
      const size: Vec3 = [range(rng, BUILDING_WIDTH), range(rng, BUILDING_HEIGHT), range(rng, BUILDING_WIDTH)];
      const box = boxFor(position, size);

      const clearOfSpawn = distanceXZ(position, spawn) > SPAWN_CLEARANCE && !inSpawnLane(box);
      const clearOfPortals = portals.every((p) => distanceXZ(position, p.position) > PORTAL_CLEARANCE);
      const clearOfTowers = buildings.every((b) => !boxesTouch(b.box, box, BUILDING_GAP));
      if (clearOfSpawn && clearOfPortals && clearOfTowers) {
        buildings.push({ position, size, box });
        break;
      }
    }
  }

  return { buildings, portals };
}
