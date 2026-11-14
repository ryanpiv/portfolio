import type { Project } from "@data/projects";

import type { Aabb } from "./collision";
import { createRng, type Vec3 } from "./fieldLayout";

/**
 * Deterministic layout for the free-roam arena: a ring of portals (one per
 * project), a handful of tower districts with downtown cores, parks in the
 * gaps between them, and trees in the parks and along the streets. Pure,
 * so the scene can `useMemo` it and tests can pin it.
 */

export type Building = {
  /** Footprint center on the ground plane. */
  position: Vec3;
  /** Full extents: width (x), height (y), depth (z). */
  size: Vec3;
  box: Aabb;
  /** Palette pick in [0, 1); towers in one district share a hue. */
  tint: number;
  /** Per-tower hash in [0, 1) for the window pattern. */
  seed: number;
};

export type Park = {
  position: Vec3;
  radius: number;
};

export type Tree = {
  position: Vec3;
  height: number;
  /** Canopy palette pick in [0, 1). */
  tint: number;
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
  parks: Park[];
  /** In a random order so `slice(0, n)` is a fair thinning. */
  trees: Tree[];
};

export type ArenaLayoutOptions = {
  seed: number;
  radius: number;
  buildingCount: number;
  treeCount: number;
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
const LANE_HALF_WIDTH = 20;
const LANE_LENGTH = 190;
/** Portal 0 sits ahead and to the left of the spawn: in view on load, but not on the nose. */
const FIRST_PORTAL_ANGLE = -Math.PI / 2 - Math.PI / 6;
const BUILDING_GAP = 4;
const BUILDING_WIDTH: [number, number] = [6, 16];
const BUILDING_HEIGHT: [number, number] = [8, 44];
/** Towers are placed between these fractions of the radius. */
const BUILDING_BAND: [number, number] = [0.12, 0.95];
/** Give up on a tower after this many rejected placements. */
const MAX_TRIES = 40;

/** Districts: how many, where their centers may fall, how far they spread. */
const DISTRICT_COUNT = 7;
const DISTRICT_BAND: [number, number] = [0.3, 0.78];
const DISTRICT_RADIUS_FRACTION = 0.24;
/** Towers near a district's center are up to this much taller; the edge this much shorter. */
const CORE_HEIGHT_BOOST = 1.5;
const EDGE_HEIGHT_SCALE = 0.6;
/** How far a tower's tint may drift from its district's. */
const TINT_DRIFT = 0.08;

/** Parks: open circles in the gaps between districts. */
const PARK_COUNT = 5;
const PARK_BAND: [number, number] = [0.3, 0.75];
const PARK_RADIUS_FRACTION: [number, number] = [0.07, 0.11];
/** Fraction of trees that go in parks; the rest line the streets. */
const PARK_TREE_SHARE = 0.65;
const TREE_HEIGHT: [number, number] = [3.5, 7.5];
const TREE_BAND: [number, number] = [0.1, 0.95];
/** Street trees keep this much clear of tower walls. */
const TREE_WALL_GAP = 1;

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

function pointInBox(p: Vec3, box: Aabb, gap: number): boolean {
  return p[0] > box.min[0] - gap && p[0] < box.max[0] + gap && p[2] > box.min[2] - gap && p[2] < box.max[2] + gap;
}

/** Nearest park the point falls inside, if any. */
function inPark(p: Vec3, parks: ReadonlyArray<Park>): boolean {
  return parks.some((park) => distanceXZ(p, park.position) < park.radius);
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

type District = { center: Vec3; radius: number; tint: number };

/** District centers spaced around the arena with some jitter; parks go in the gaps between them. */
function layoutDistricts(rng: () => number, radius: number): { districts: District[]; parks: Park[] } {
  const step = (Math.PI * 2) / DISTRICT_COUNT;
  const districts: District[] = [];
  for (let i = 0; i < DISTRICT_COUNT; i++) {
    const angle = i * step + (rng() - 0.5) * step * 0.5;
    const distance = radius * range(rng, DISTRICT_BAND);
    districts.push({
      center: [Math.cos(angle) * distance, 0, Math.sin(angle) * distance],
      radius: radius * DISTRICT_RADIUS_FRACTION,
      tint: rng(),
    });
  }

  const parks: Park[] = [];
  const parkStep = (Math.PI * 2) / PARK_COUNT;
  for (let i = 0; i < PARK_COUNT; i++) {
    const angle = (i + 0.5) * parkStep + (rng() - 0.5) * parkStep * 0.3;
    const distance = radius * range(rng, PARK_BAND);
    const position: Vec3 = [Math.cos(angle) * distance, 0, Math.sin(angle) * distance];
    const parkRadius = radius * range(rng, PARK_RADIUS_FRACTION);
    if (distanceXZ(position, [0, 0, 0]) < SPAWN_CLEARANCE * 2) continue;
    if (inSpawnLane(boxFor(position, [parkRadius * 2, 1, parkRadius * 2]))) continue;
    parks.push({ position, radius: parkRadius });
  }
  return { districts, parks };
}

export function layoutArena({ seed, radius, buildingCount, treeCount, projects }: ArenaLayoutOptions): ArenaLayout {
  const rng = createRng(seed);
  const portals = layoutPortals(projects, radius);
  const { districts, parks } = layoutDistricts(rng, radius);
  const buildings: Building[] = [];
  const spawn: Vec3 = [0, 0, 0];

  for (let i = 0; i < buildingCount; i++) {
    const district = districts[i % districts.length];
    for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
      // Denser toward the district center: sqrt gives a uniform disc, squaring it pulls inward.
      const spread = rng() ** 1.5;
      const angle = rng() * Math.PI * 2;
      const position: Vec3 = [
        district.center[0] + Math.cos(angle) * spread * district.radius,
        0,
        district.center[2] + Math.sin(angle) * spread * district.radius,
      ];
      const fromCenter = Math.hypot(position[0], position[2]) / radius;
      if (fromCenter < BUILDING_BAND[0] || fromCenter > BUILDING_BAND[1]) continue;

      const heightScale = CORE_HEIGHT_BOOST - (CORE_HEIGHT_BOOST - EDGE_HEIGHT_SCALE) * spread;
      const size: Vec3 = [range(rng, BUILDING_WIDTH), range(rng, BUILDING_HEIGHT) * heightScale, range(rng, BUILDING_WIDTH)];
      const box = boxFor(position, size);

      const clearOfSpawn = distanceXZ(position, spawn) > SPAWN_CLEARANCE && !inSpawnLane(box);
      const clearOfPortals = portals.every((p) => distanceXZ(position, p.position) > PORTAL_CLEARANCE);
      const clearOfParks = parks.every((park) => distanceXZ(position, park.position) > park.radius + size[0] / 2);
      const clearOfTowers = buildings.every((b) => !boxesTouch(b.box, box, BUILDING_GAP));
      if (clearOfSpawn && clearOfPortals && clearOfParks && clearOfTowers) {
        const tint = (district.tint + (rng() - 0.5) * TINT_DRIFT + 1) % 1;
        buildings.push({ position, size, box, tint, seed: rng() });
        break;
      }
    }
  }

  const trees: Tree[] = [];
  for (let i = 0; i < treeCount; i++) {
    let position: Vec3 | null = null;
    if (parks.length && rng() < PARK_TREE_SHARE) {
      const park = parks[Math.floor(rng() * parks.length)];
      const r = Math.sqrt(rng()) * park.radius;
      const angle = rng() * Math.PI * 2;
      position = [park.position[0] + Math.cos(angle) * r, 0, park.position[2] + Math.sin(angle) * r];
    } else {
      for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
        const angle = rng() * Math.PI * 2;
        const distance = radius * range(rng, TREE_BAND);
        const candidate: Vec3 = [Math.cos(angle) * distance, 0, Math.sin(angle) * distance];
        if (distanceXZ(candidate, spawn) < SPAWN_CLEARANCE) continue;
        if (inSpawnLane(boxFor(candidate, [1, 1, 1]))) continue;
        if (inPark(candidate, parks)) continue;
        if (buildings.some((b) => pointInBox(candidate, b.box, TREE_WALL_GAP))) continue;
        position = candidate;
        break;
      }
    }
    if (position) trees.push({ position, height: range(rng, TREE_HEIGHT), tint: rng() });
  }

  return { buildings, portals, parks, trees };
}
