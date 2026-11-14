import { roamConfig } from "@data/lab";
import type { Aabb } from "@utils/collision";
import type { Vec3 } from "@utils/fieldLayout";

import { collisionDamage, slideAlongTowers } from "../roam/shipCollision";

const wall: Aabb = { min: [10, 0, -50], max: [20, 100, 50] };

describe("slideAlongTowers", () => {
  it("leaves a clear ship alone", () => {
    const center: Vec3 = [0, 10, 0];
    expect(slideAlongTowers(center, 1, [wall], [1, 0, 0])).toBe(0);
    expect(center).toEqual([0, 10, 0]);
  });

  it("pushes the ship out and rates a nose-first hit at 1", () => {
    const center: Vec3 = [10.5, 10, 0];
    const severity = slideAlongTowers(center, 1, [wall], [1, 0, 0]);
    expect(severity).toBeCloseTo(1);
    expect(center[0]).toBeCloseTo(9);
  });

  it("rates a sideways graze at 0 while still sliding out", () => {
    const center: Vec3 = [10.5, 10, 0];
    expect(slideAlongTowers(center, 1, [wall], [0, 0, 1])).toBeCloseTo(0);
    expect(center[0]).toBeCloseTo(9);
  });
});

describe("collisionDamage", () => {
  const rules = roamConfig.collision;

  it("kills outright at or above the fatal threshold", () => {
    expect(collisionDamage(rules.fatalAbove, rules)).toBe(Infinity);
  });

  it("steps down through heavy and light", () => {
    expect(collisionDamage(rules.heavyAbove, rules)).toBe(rules.heavyDamage);
    expect(collisionDamage(rules.heavyAbove / 2, rules)).toBe(rules.lightDamage);
  });
});
