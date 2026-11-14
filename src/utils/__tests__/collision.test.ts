import { segmentHitsSphere, spheresOverlap } from "../collision";

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
