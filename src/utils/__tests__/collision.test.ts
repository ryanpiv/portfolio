import type { Vec3 } from "../fieldLayout";

import { resolveSphereAabb, segmentCrossesDisc, segmentHitsSphere, spheresOverlap, type Aabb } from "../collision";

describe("spheresOverlap", () => {
  it("overlaps when centres are closer than the summed radii", () => {
    expect(spheresOverlap([0, 0, 0], 1, [1.5, 0, 0], 1)).toBe(true);
    expect(spheresOverlap([0, 0, 0], 1, [2.5, 0, 0], 1)).toBe(false);
  });

  it("counts touching as overlap", () => {
    expect(spheresOverlap([0, 0, 0], 1, [2, 0, 0], 1)).toBe(true);
  });
});

describe("segmentHitsSphere", () => {
  it("hits when the sphere sits on the path", () => {
    expect(segmentHitsSphere([0, 0, 0], [0, 0, -10], [0.5, 0, -5], 1)).toBe(true);
  });

  it("misses when the sphere is beside the path", () => {
    expect(segmentHitsSphere([0, 0, 0], [0, 0, -10], [3, 0, -5], 1)).toBe(false);
  });

  it("does not extend past the segment ends", () => {
    expect(segmentHitsSphere([0, 0, 0], [0, 0, -10], [0, 0, -12], 1)).toBe(false);
    expect(segmentHitsSphere([0, 0, 0], [0, 0, -10], [0, 0, -10.5], 1)).toBe(true);
  });

  it("catches a fast projectile that would tunnel between frames", () => {
    // Enemy radius 1 at z=-5; the bolt jumped from -3 to -8 in one frame.
    expect(segmentHitsSphere([0, 0, -3], [0, 0, -8], [0, 0, -5], 1)).toBe(true);
  });

  it("treats a zero-length segment as a point", () => {
    expect(segmentHitsSphere([1, 0, 0], [1, 0, 0], [0, 0, 0], 1)).toBe(true);
    expect(segmentHitsSphere([2, 0, 0], [2, 0, 0], [0, 0, 0], 1)).toBe(false);
  });
});

describe("resolveSphereAabb", () => {
  const box: Aabb = { min: [-1, 0, -1], max: [1, 4, 1] };

  it("returns null when the sphere is clear of the box", () => {
    expect(resolveSphereAabb([3, 2, 0], 1, box)).toBeNull();
    expect(resolveSphereAabb([0, 6, 0], 1, box)).toBeNull();
  });

  it("pushes a sphere straddling a face straight out of it", () => {
    expect(resolveSphereAabb([1.5, 2, 0], 1, box)).toEqual([2, 2, 0]);
    expect(resolveSphereAabb([0, 4.5, 0], 1, box)).toEqual([0, 5, 0]);
  });

  it("pushes diagonally away from an edge", () => {
    const out = resolveSphereAabb([1.5, 2, 1.5], 1, box)!;
    expect(out[1]).toBe(2);
    expect(Math.hypot(out[0] - 1, out[2] - 1)).toBeCloseTo(1);
  });

  it("exits through the nearest face when the centre is inside", () => {
    expect(resolveSphereAabb([0.8, 2, 0], 0.5, box)).toEqual([1.5, 2, 0]);
    expect(resolveSphereAabb([0, 0.2, 0], 0.5, box)).toEqual([0, -0.5, 0]);
  });
});

describe("segmentCrossesDisc", () => {
  const center: Vec3 = [0, 5, 0];
  const normal: Vec3 = [0, 0, 1];

  it("detects a path through the ring", () => {
    expect(segmentCrossesDisc([0.5, 5, 2], [0.5, 5, -2], center, normal, 3)).toBe(true);
  });

  it("rejects a path through the plane but outside the ring", () => {
    expect(segmentCrossesDisc([5, 5, 2], [5, 5, -2], center, normal, 3)).toBe(false);
  });

  it("rejects a path that stays on one side of the plane", () => {
    expect(segmentCrossesDisc([0, 5, 2], [0, 5, 1], center, normal, 3)).toBe(false);
    expect(segmentCrossesDisc([0, 5, 1], [0, 5, 1], center, normal, 3)).toBe(false);
  });

  it("works in either direction and at a slant", () => {
    expect(segmentCrossesDisc([0, 5, -2], [0, 5, 2], center, normal, 3)).toBe(true);
    expect(segmentCrossesDisc([-2, 3, 2], [2, 7, -2], center, normal, 3)).toBe(true);
  });
});
