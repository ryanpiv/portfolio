import { noseToward, turnToward, wrapAngle, yawToward } from "../game/steering";

describe("steering", () => {
  it("wraps angles into (-π, π]", () => {
    expect(wrapAngle(Math.PI * 3)).toBeCloseTo(Math.PI);
    expect(wrapAngle(-Math.PI * 1.5)).toBeCloseTo(Math.PI / 2);
    expect(wrapAngle(0.5)).toBeCloseTo(0.5);
  });

  it("turns the short way round, limited by the step", () => {
    expect(turnToward(0, 1, 0.25)).toBeCloseTo(0.25);
    expect(turnToward(0, 0.1, 0.25)).toBeCloseTo(0.1);
    // 350° is 10° to the left of 0°, not 350° to the right.
    expect(turnToward(0, (350 * Math.PI) / 180, 0.05)).toBeCloseTo(-0.05);
  });

  it("yaws so the nose (local −z) faces the target", () => {
    // Nose along −z at yaw 0; a target straight down −z needs no turn.
    expect(noseToward([0, 0, 0], [0, 0, -5])).toBeCloseTo(0);
    // Yaw +π/2 swings the nose to −x.
    expect(noseToward([0, 0, 0], [-5, 0, 0])).toBeCloseTo(Math.PI / 2);
    // From the arena edge at +x, home (toward −x) is at yaw +π/2.
    expect(noseToward([230, 0, 0], [0, 0, 0])).toBeCloseTo(Math.PI / 2);
  });

  it("yaws so local +z faces the target", () => {
    expect(yawToward([0, 0, 0], [0, 0, 5])).toBeCloseTo(0);
    expect(yawToward([0, 0, 0], [5, 0, 0])).toBeCloseTo(Math.PI / 2);
    expect(yawToward([0, 0, 0], [0, 0, -5])).toBeCloseTo(Math.PI);
  });
});
