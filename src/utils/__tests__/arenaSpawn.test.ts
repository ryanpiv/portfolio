import { findClearPoint, isClear, randomClearPoint, respawnYaw } from "../arenaSpawn";
import type { Aabb } from "../collision";
import { createRng } from "../fieldLayout";

const tower: Aabb = { min: [-5, 0, -5], max: [5, 40, 5] };
const bounds = { radius: 100, minAltitude: 2, maxAltitude: 60 };

describe("isClear", () => {
  it("rejects points inside or within clearance of a box", () => {
    expect(isClear([0, 10, 0], [tower], 4)).toBe(false);
    expect(isClear([8, 10, 0], [tower], 4)).toBe(false);
    expect(isClear([10, 10, 0], [tower], 4)).toBe(true);
    expect(isClear([0, 50, 0], [tower], 4)).toBe(true);
  });
});

describe("findClearPoint", () => {
  it("keeps a clear origin", () => {
    expect(findClearPoint([30, 10, 0], [tower], 4, bounds)).toEqual([30, 10, 0]);
  });

  it("moves out of a tower to a nearby clear point", () => {
    const out = findClearPoint([0, 10, 0], [tower], 4, bounds);
    expect(isClear(out, [tower], 4)).toBe(true);
    expect(Math.hypot(out[0], out[2])).toBeLessThan(20);
  });

  it("clamps into the arena and altitude band", () => {
    const out = findClearPoint([300, -10, 0], [tower], 4, bounds);
    expect(Math.hypot(out[0], out[2])).toBeLessThanOrEqual(bounds.radius + 1e-9);
    expect(out[1]).toBe(bounds.minAltitude);
  });
});

describe("randomClearPoint", () => {
  it("returns clear points inside the bounds", () => {
    const rng = createRng(3);
    for (let i = 0; i < 20; i++) {
      const p = randomClearPoint(rng, [tower], 4, bounds);
      expect(isClear(p, [tower], 4)).toBe(true);
      expect(Math.hypot(p[0], p[2])).toBeLessThanOrEqual(bounds.radius);
      expect(p[1]).toBeGreaterThanOrEqual(bounds.minAltitude);
      expect(p[1]).toBeLessThanOrEqual(bounds.maxAltitude);
    }
  });
});

describe("respawnYaw", () => {
  it("keeps the heading when the way ahead is open", () => {
    // Nose along −z from z = 50: nothing ahead until the tower at z∈[-5,5], 55 away.
    expect(respawnYaw([40, 10, 50], 0, [tower], 2)).toBe(0);
  });

  it("faces the center when a tower is dead ahead", () => {
    const offCenter: Aabb = { min: [55, 0, -5], max: [65, 40, 5] };
    // From (80, 10, 0) with the nose toward −x (yaw +π/2) the tower is 15 ahead → turn to the center, also −x here.
    expect(respawnYaw([80, 10, 0], Math.PI / 2, [offCenter], 2)).toBeCloseTo(Math.PI / 2);
    // From (60, 10, 40) heading −z the tower is 35 ahead → face the center instead (nose toward (0,0)).
    expect(respawnYaw([60, 10, 40], 0, [offCenter], 2)).toBeCloseTo(Math.atan2(60, 40));
    // Same spot heading +z is open: keep it.
    expect(respawnYaw([60, 10, 40], Math.PI, [offCenter], 2)).toBeCloseTo(Math.PI);
  });
});
