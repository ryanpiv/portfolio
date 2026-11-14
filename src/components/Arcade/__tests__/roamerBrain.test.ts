import { roamConfig } from "@data/lab";
import type { Vec3 } from "@utils/fieldLayout";

import {
  awayFrom,
  downRoamer,
  pickSpawnPoint,
  randomRoamPoint,
  spawnRoamer,
  stepRoamer,
  tickRespawn,
  type RoamerSenses,
} from "../roam/roamerBrain";

const tuning = roamConfig.roamers;
const ARENA = roamConfig.arena.radius;
const FIRE_INTERVAL = 1.5;
const FAR_SHIP: Vec3 = [1000, 30, 1000];

const senses = (overrides: Partial<RoamerSenses> = {}): RoamerSenses => ({
  shipPosition: FAR_SHIP,
  boltNear: false,
  shipLive: true,
  ...overrides,
});

const fixedPoint = (): Vec3 => [0, 40, 0];

describe("randomRoamPoint / pickSpawnPoint", () => {
  it("stays inside the play fraction and the altitude band", () => {
    let i = 0;
    const rng = () => [0.999, 0.999, 0.999][i++ % 3];
    const p = randomRoamPoint(rng, tuning, ARENA);
    expect(Math.hypot(p[0], p[2])).toBeLessThanOrEqual(ARENA * tuning.playFraction + 1e-6);
    expect(p[1]).toBeGreaterThanOrEqual(tuning.minAltitude);
    expect(p[1]).toBeLessThanOrEqual(tuning.maxAltitude);
  });

  it("keeps trying for a point far from the ship", () => {
    const candidates: Vec3[] = [
      [0, 40, 0],
      [5, 40, 0],
      [200, 40, 0],
    ];
    let i = 0;
    const p = pickSpawnPoint(() => candidates[i++], [0, 30, 0], tuning.respawnMinDistance);
    expect(p).toEqual([200, 40, 0]);
  });
});

describe("stepRoamer", () => {
  it("cruises toward its waypoint and picks a new one on arrival", () => {
    const m = spawnRoamer([0, 40, 0], [0, 40, 100], 0, 100);
    stepRoamer(m, senses(), tuning, ARENA, FIRE_INTERVAL, 1, fixedPoint);
    expect(m.position[2]).toBeCloseTo(tuning.cruiseSpeed);
    expect(m.alarm).toBe(0);

    const near = spawnRoamer([0, 40, 0], [0, 40, tuning.waypointReach / 2], 0, 100);
    const pick = jest.fn(() => [50, 40, 50] as Vec3);
    stepRoamer(near, senses(), tuning, ARENA, FIRE_INTERVAL, 0.016, pick);
    expect(pick).toHaveBeenCalled();
    expect(near.waypoint).toEqual([50, 40, 50]);
  });

  it("is spooked by a close ship: runs away faster and holds fire for the head start", () => {
    const m = spawnRoamer([10, 40, 0], [0, 40, 100], 0, 100);
    const close = senses({ shipPosition: [0, 40, 0] });
    const step = stepRoamer(m, close, tuning, ARENA, FIRE_INTERVAL, 0.1, fixedPoint);
    expect(m.alarm).toBeCloseTo(tuning.alarmSeconds - 0.1);
    // The waypoint is pushed away from the ship along +x.
    expect(m.waypoint[0]).toBeGreaterThan(10);
    expect(step.fire).toBe(false);
  });

  it("returns fire once the head start elapses, then on the weapon interval", () => {
    const m = spawnRoamer([10, 40, 0], [0, 40, 100], 0, 100);
    const close = senses({ shipPosition: [0, 40, 0] });
    const first = stepRoamer(m, close, tuning, ARENA, FIRE_INTERVAL, tuning.firstShotDelay + 0.01, fixedPoint);
    expect(first.fire).toBe(true);
    expect(m.cooldown).toBe(FIRE_INTERVAL);
    const next = stepRoamer(m, close, tuning, ARENA, FIRE_INTERVAL, 0.1, fixedPoint);
    expect(next.fire).toBe(false);
  });

  it("does not shoot a ship that cannot be hurt, or one out of range", () => {
    const m = spawnRoamer([10, 40, 0], [0, 40, 100], 0, 100);
    const dead = senses({ shipPosition: [0, 40, 0], shipLive: false });
    expect(stepRoamer(m, dead, tuning, ARENA, FIRE_INTERVAL, 5, fixedPoint).fire).toBe(false);

    const spooked = spawnRoamer([0, 40, 0], [0, 40, 100], 0, 100);
    spooked.alarm = tuning.alarmSeconds;
    spooked.cooldown = 0;
    const far = senses({ shipPosition: [tuning.fireRange + 50, 40, 0] });
    expect(stepRoamer(spooked, far, tuning, ARENA, FIRE_INTERVAL, 0.1, fixedPoint).fire).toBe(false);
  });

  it("a passing bolt spooks it too", () => {
    const m = spawnRoamer([0, 40, 0], [0, 40, 100], 0, 100);
    stepRoamer(m, senses({ boltNear: true }), tuning, ARENA, FIRE_INTERVAL, 0.016, fixedPoint);
    expect(m.alarm).toBeGreaterThan(0);
  });
});

describe("down / respawn", () => {
  it("counts down and reports when it is time to come back", () => {
    const m = spawnRoamer([0, 40, 0], [0, 40, 100], 0, 100);
    downRoamer(m, 2);
    expect(m.alive).toBe(false);
    expect(tickRespawn(m, 1)).toBe(false);
    expect(tickRespawn(m, 1.1)).toBe(true);
  });
});

describe("awayFrom", () => {
  it("pushes directly away from the threat and clamps to the play radius", () => {
    expect(awayFrom([10, 40, 0], [0, 40, 0], 70, 1000, [0, 33, 0])).toEqual([80, 33, 0]);
    const clamped = awayFrom([90, 40, 0], [0, 40, 0], 70, 100, [0, 33, 0]);
    expect(Math.hypot(clamped[0], clamped[2])).toBeCloseTo(100);
  });

  it("falls back when sitting on the threat", () => {
    expect(awayFrom([0, 40, 0], [0, 40, 0], 70, 100, [7, 33, 7])).toEqual([7, 33, 7]);
  });
});
