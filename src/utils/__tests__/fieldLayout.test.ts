import { projects } from "@data/projects";
import {
  STATUS_RADIUS,
  createRng,
  frustumHalfExtents,
  layoutField,
  massFor,
  radiusFor,
} from "@utils/fieldLayout";

const bounds = { halfWidth: 12, halfHeight: 7, halfDepth: 3 };
const speed: [number, number] = [0.5, 1.5];

describe("createRng", () => {
  it("is deterministic for a seed and stays in [0, 1)", () => {
    const a = createRng(42);
    const b = createRng(42);
    for (let i = 0; i < 50; i++) {
      const value = a();
      expect(value).toBe(b());
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("radiusFor / massFor", () => {
  it("orders radii by status with live largest", () => {
    const live = radiusFor({ slug: "x", status: "live" });
    const progress = radiusFor({ slug: "x", status: "in-progress" });
    const rewrite = radiusFor({ slug: "x", status: "rewrite-planned" });
    const showcase = radiusFor({ slug: "x", status: "showcase" });
    expect(live).toBeGreaterThan(progress);
    expect(progress).toBeGreaterThan(rewrite);
    expect(rewrite).toBeGreaterThan(showcase);
  });

  it("jitters by slug but stays near the status base", () => {
    const a = radiusFor({ slug: "parse-ai", status: "live" });
    const b = radiusFor({ slug: "wow-tools", status: "live" });
    expect(a).not.toBe(b);
    expect(Math.abs(a - STATUS_RADIUS.live)).toBeLessThanOrEqual(0.06);
    expect(Math.abs(b - STATUS_RADIUS.live)).toBeLessThanOrEqual(0.06);
  });

  it("gives bigger spheres more mass", () => {
    expect(massFor(1)).toBeGreaterThan(massFor(0.5));
  });
});

describe("layoutField", () => {
  it("returns one body per project in registry order", () => {
    const bodies = layoutField(projects, { bounds, speed });
    expect(bodies).toHaveLength(projects.length);
    expect(bodies.map((b) => b.slug)).toEqual(projects.map((p) => p.slug));
  });

  it("is deterministic for the same seed and differs across seeds", () => {
    const a = layoutField(projects, { bounds, speed, seed: 7 });
    const b = layoutField(projects, { bounds, speed, seed: 7 });
    const c = layoutField(projects, { bounds, speed, seed: 8 });
    expect(a).toEqual(b);
    expect(a.map((x) => x.position)).not.toEqual(c.map((x) => x.position));
  });

  it("keeps every sphere fully inside the bounds", () => {
    const bodies = layoutField(projects, { bounds, speed });
    for (const body of bodies) {
      const [x, y, z] = body.position;
      expect(Math.abs(x) + body.radius).toBeLessThanOrEqual(bounds.halfWidth + 1e-9);
      expect(Math.abs(y) + body.radius).toBeLessThanOrEqual(bounds.halfHeight + 1e-9);
      expect(Math.abs(z) + body.radius).toBeLessThanOrEqual(bounds.halfDepth + 1e-9);
    }
  });

  it("does not overlap spheres at spawn when there is room", () => {
    const bodies = layoutField(projects, { bounds, speed, padding: 0.2 });
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        const gap =
          Math.hypot(
            a.position[0] - b.position[0],
            a.position[1] - b.position[1],
            a.position[2] - b.position[2],
          ) -
          a.radius -
          b.radius;
        expect(gap).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("gives every body a velocity within the requested speed range", () => {
    const bodies = layoutField(projects, { bounds, speed });
    for (const body of bodies) {
      const mag = Math.hypot(...body.velocity);
      expect(mag).toBeGreaterThanOrEqual(speed[0] - 1e-9);
      expect(mag).toBeLessThanOrEqual(speed[1] + 1e-9);
    }
  });
});

describe("frustumHalfExtents", () => {
  it("matches tan(fov/2) * distance and scales width by aspect", () => {
    const { halfWidth, halfHeight } = frustumHalfExtents(90, 2, 10);
    expect(halfHeight).toBeCloseTo(10);
    expect(halfWidth).toBeCloseTo(20);
  });
});
