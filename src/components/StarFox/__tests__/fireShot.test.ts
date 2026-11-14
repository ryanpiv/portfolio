import { fireShot } from "../game/fireShot";
import { createSim } from "../game/sim";

describe("fireShot", () => {
  it("aims a pooled shot at the target and adds the world scroll on z", () => {
    const { shots } = createSim();
    expect(fireShot(shots, [0, 5, -100], [0, 5, 0], 50, 40)).toBe(true);
    const shot = shots.find((s) => s.active)!;
    expect(shot.position).toEqual([0, 5, -100]);
    expect(shot.velocity).toEqual([0, 0, 90]);
  });

  it("normalises the aim direction", () => {
    const { shots } = createSim();
    fireShot(shots, [0, 0, 0], [3, 0, 4], 10, 0);
    expect(shots[0].velocity).toEqual([6, 0, 8]);
  });

  it("fails when the pool is exhausted", () => {
    const { shots } = createSim();
    shots.forEach((s) => (s.active = true));
    expect(fireShot(shots, [0, 0, 0], [0, 0, 1], 1, 0)).toBe(false);
  });
});
