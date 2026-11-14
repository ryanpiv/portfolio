import { ROLL_DURATION, rollAngle, startRoll, stepRoll, type Roll } from "../game/barrelRoll";

describe("barrelRoll", () => {
  it("spins one full turn over its duration and then ends", () => {
    let roll: Roll | null = startRoll(1);
    expect(rollAngle(roll)).toBe(-0);

    roll = stepRoll(roll, ROLL_DURATION / 2);
    expect(rollAngle(roll)).toBeCloseTo(-Math.PI);

    roll = stepRoll(roll, ROLL_DURATION);
    expect(roll).toBeNull();
    expect(rollAngle(roll)).toBe(0);
  });

  it("rolls left as a positive rotation", () => {
    const roll = stepRoll(startRoll(-1), ROLL_DURATION / 2);
    expect(rollAngle(roll)).toBeCloseTo(Math.PI);
  });

  it("eases: slow at the ends, fast in the middle", () => {
    const quarter = Math.abs(rollAngle(stepRoll(startRoll(1), ROLL_DURATION * 0.25)));
    const half = Math.abs(rollAngle(stepRoll(startRoll(1), ROLL_DURATION * 0.5)));
    expect(quarter).toBeLessThan(half / 2);
  });
});
