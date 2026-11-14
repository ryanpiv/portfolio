import { projects } from "@data/projects";

import { layoutArena, layoutPortals, PORTAL_ALTITUDE, PORTAL_RING_FRACTION } from "../arenaLayout";

const options = { seed: 11, radius: 200, buildingCount: 60, treeCount: 120, projects };

describe("layoutPortals", () => {
  it("places one portal per project on the ring, facing the center, the first ahead-left of the spawn", () => {
    const portals = layoutPortals(projects, 200);
    expect(portals.map((p) => p.project.slug)).toEqual(projects.map((p) => p.slug));
    expect(portals[0].position[2]).toBeLessThan(-50);
    expect(portals[0].position[0]).toBeLessThan(-20);
    for (const portal of portals) {
      const [x, y, z] = portal.position;
      expect(Math.hypot(x, z)).toBeCloseTo(200 * PORTAL_RING_FRACTION);
      expect(y).toBe(PORTAL_ALTITUDE);
      // The normal points from the portal toward the origin.
      const toCenter = [-x, 0, -z].map((v) => v / Math.hypot(x, z));
      expect(portal.normal[0]).toBeCloseTo(toCenter[0]);
      expect(portal.normal[2]).toBeCloseTo(toCenter[2]);
    }
  });
});

describe("layoutArena", () => {
  it("is deterministic for a seed", () => {
    expect(layoutArena(options)).toEqual(layoutArena(options));
    expect(layoutArena(options).buildings[0]).not.toEqual(layoutArena({ ...options, seed: 12 }).buildings[0]);
  });

  it("places towers on the ground, inside the arena, clear of the spawn and the portals", () => {
    const { buildings, portals } = layoutArena(options);
    expect(buildings.length).toBeGreaterThan(options.buildingCount * 0.6);
    for (const b of buildings) {
      expect(b.box.min[1]).toBe(0);
      expect(b.box.max[1]).toBe(b.size[1]);
      expect(Math.hypot(b.position[0], b.position[2])).toBeLessThan(options.radius);
      expect(Math.hypot(b.position[0], b.position[2])).toBeGreaterThan(20);
      for (const p of portals) {
        expect(Math.hypot(b.position[0] - p.position[0], b.position[2] - p.position[2])).toBeGreaterThan(15);
      }
    }
  });

  it("keeps the take-off lane ahead of the spawn clear", () => {
    const { buildings } = layoutArena(options);
    for (const b of buildings) {
      const crossesLane = b.box.max[0] > -20 && b.box.min[0] < 20 && b.box.min[2] < 0 && b.box.max[2] > -190;
      expect(crossesLane).toBe(false);
    }
  });

  it("keeps towers out of the parks and the parks away from the spawn", () => {
    const { buildings, parks } = layoutArena(options);
    expect(parks.length).toBeGreaterThan(2);
    for (const park of parks) {
      expect(Math.hypot(park.position[0], park.position[2])).toBeGreaterThan(40);
      for (const b of buildings) {
        const d = Math.hypot(b.position[0] - park.position[0], b.position[2] - park.position[2]);
        expect(d).toBeGreaterThan(park.radius);
      }
    }
  });

  it("gives every tower a tint and a seed in [0, 1)", () => {
    for (const b of layoutArena(options).buildings) {
      expect(b.tint).toBeGreaterThanOrEqual(0);
      expect(b.tint).toBeLessThan(1);
      expect(b.seed).toBeGreaterThanOrEqual(0);
      expect(b.seed).toBeLessThan(1);
    }
  });

  it("plants trees on the ground, inside the arena, and never inside a tower", () => {
    const { trees, buildings } = layoutArena(options);
    expect(trees.length).toBeGreaterThan(options.treeCount * 0.8);
    for (const t of trees) {
      expect(t.position[1]).toBe(0);
      expect(Math.hypot(t.position[0], t.position[2])).toBeLessThan(options.radius);
      expect(t.height).toBeGreaterThanOrEqual(3.5);
      for (const b of buildings) {
        const inside =
          t.position[0] > b.box.min[0] && t.position[0] < b.box.max[0] && t.position[2] > b.box.min[2] && t.position[2] < b.box.max[2];
        expect(inside).toBe(false);
      }
    }
  });

  it("keeps towers from overlapping", () => {
    const { buildings } = layoutArena(options);
    for (let i = 0; i < buildings.length; i++) {
      for (let j = i + 1; j < buildings.length; j++) {
        const a = buildings[i].box;
        const b = buildings[j].box;
        const overlap = a.min[0] < b.max[0] && a.max[0] > b.min[0] && a.min[2] < b.max[2] && a.max[2] > b.min[2];
        expect(overlap).toBe(false);
      }
    }
  });
});
