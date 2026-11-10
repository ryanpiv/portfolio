import type { Project, ProjectStatus } from "@data/projects";

/**
 * Pure layout for the physics-field lab: turns the project registry into
 * sphere bodies with a radius, mass, seeded start position, and drift
 * velocity. No three.js or physics imports so it stays unit-testable.
 */

export type Vec3 = [x: number, y: number, z: number];

export type FieldBody = {
  slug: string;
  status: ProjectStatus;
  radius: number;
  mass: number;
  position: Vec3;
  velocity: Vec3;
};

export type FieldBounds = {
  /** Half-extents of the spawn volume in world units. */
  halfWidth: number;
  halfHeight: number;
  halfDepth: number;
};

export type FieldLayoutOptions = {
  seed?: number;
  bounds: FieldBounds;
  /** Initial speed range, world units / s. */
  speed: [min: number, max: number];
  /** Minimum gap between sphere surfaces at spawn. */
  padding?: number;
};

/** Sphere radius by status — most "alive" work is biggest. */
export const STATUS_RADIUS: Record<ProjectStatus, number> = {
  live: 0.85,
  "in-progress": 0.66,
  "rewrite-planned": 0.52,
  showcase: 0.4,
};

/** Small deterministic radius wobble so same-status spheres are not clones. */
const RADIUS_JITTER = 0.06;

/** mulberry32 — tiny seedable PRNG, deterministic across runs. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function radiusFor(project: Pick<Project, "slug" | "status">): number {
  const jitter = (createRng(hashSlug(project.slug))() * 2 - 1) * RADIUS_JITTER;
  return Number((STATUS_RADIUS[project.status] + jitter).toFixed(3));
}

/** Mass scales with volume so big spheres shove small ones. */
export function massFor(radius: number): number {
  return Number(((4 / 3) * Math.PI * radius ** 3).toFixed(3));
}

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function randomDirection(rng: () => number): Vec3 {
  // Bias toward the screen plane: z gets a quarter of the variance.
  const theta = rng() * Math.PI * 2;
  const z = (rng() * 2 - 1) * 0.25;
  const r = Math.sqrt(1 - z * z);
  return [Math.cos(theta) * r, Math.sin(theta) * r, z];
}

/**
 * Place every project as a sphere inside the bounds without overlaps
 * (rejection sampling; falls back to the best attempt if the volume is
 * too crowded). Larger spheres are placed first so they get room.
 */
export function layoutField(
  projects: Project[],
  options: FieldLayoutOptions,
): FieldBody[] {
  const { seed = 1, bounds, speed, padding = 0.25 } = options;
  const rng = createRng(seed);

  const sorted = [...projects].sort(
    (a, b) => radiusFor(b) - radiusFor(a),
  );

  const placed: FieldBody[] = [];

  for (const project of sorted) {
    const radius = radiusFor(project);
    const mass = massFor(radius);

    const limitX = Math.max(bounds.halfWidth - radius, 0);
    const limitY = Math.max(bounds.halfHeight - radius, 0);
    const limitZ = Math.max(bounds.halfDepth - radius, 0);

    let best: Vec3 = [0, 0, 0];
    let bestClearance = -Infinity;

    for (let attempt = 0; attempt < 64; attempt++) {
      const candidate: Vec3 = [
        (rng() * 2 - 1) * limitX,
        (rng() * 2 - 1) * limitY,
        (rng() * 2 - 1) * limitZ,
      ];
      let clearance = Infinity;
      for (const other of placed) {
        const gap =
          distance(candidate, other.position) - radius - other.radius;
        if (gap < clearance) clearance = gap;
      }
      if (clearance > bestClearance) {
        best = candidate;
        bestClearance = clearance;
      }
      if (clearance >= padding) break;
    }

    const dir = randomDirection(rng);
    const mag = speed[0] + rng() * (speed[1] - speed[0]);

    placed.push({
      slug: project.slug,
      status: project.status,
      radius,
      mass,
      position: best,
      velocity: [dir[0] * mag, dir[1] * mag, dir[2] * mag],
    });
  }

  // Return in registry order so callers can zip with `projects`.
  const bySlug = new Map(placed.map((body) => [body.slug, body]));
  return projects.map((project) => bySlug.get(project.slug)!);
}

/**
 * Visible half-extents of a perspective camera's view at a given distance.
 * `fovDegrees` is the vertical field of view.
 */
export function frustumHalfExtents(
  fovDegrees: number,
  aspect: number,
  distance: number,
): { halfWidth: number; halfHeight: number } {
  const halfHeight = Math.tan((fovDegrees * Math.PI) / 360) * distance;
  return { halfWidth: halfHeight * aspect, halfHeight };
}
