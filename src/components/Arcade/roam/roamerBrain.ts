import type { RoamConfig } from "@data/lab";
import type { Vec3 } from "@utils/fieldLayout";

import { turnToward, wrapAngle, yawToward } from "../game/steering";

/**
 * Pure behaviour for one roaming fighter. The component owns the three.js
 * objects and the shared sim; this module only moves numbers so the
 * wander / scatter / return-fire rules can be tested on their own.
 */

export type RoamerTuning = RoamConfig["roamers"];

export type RoamerMotion = {
  alive: boolean;
  health: number;
  position: Vec3;
  yaw: number;
  bank: number;
  waypoint: Vec3;
  /** Seconds left of scatter. */
  alarm: number;
  /** Seconds until respawn; only meaningful while dead. */
  respawn: number;
  /** Seconds until the next shot while alarmed. */
  cooldown: number;
};

/** What a roamer notices this frame. */
export type RoamerSenses = {
  shipPosition: Vec3;
  /** A bolt passed within `boltScareDistance`. */
  boltNear: boolean;
  /** The ship can be hurt right now (not dead, not arriving, not immune). */
  shipLive: boolean;
};

export type RoamerStep = {
  /** Fire one shot at the ship this frame. */
  fire: boolean;
  /** Signed yaw rate this frame, rad / s, for banking the model. */
  turning: number;
};

/** Random point in the roamers' band, over the play area. */
export function randomRoamPoint(rng: () => number, tuning: RoamerTuning, arenaRadius: number): Vec3 {
  const angle = rng() * Math.PI * 2;
  const r = Math.sqrt(rng()) * arenaRadius * tuning.playFraction;
  const altitude = tuning.minAltitude + rng() * (tuning.maxAltitude - tuning.minAltitude);
  return [Math.cos(angle) * r, altitude, Math.sin(angle) * r];
}

/** Tries a dozen random points for one far enough from the ship; settles for the last otherwise. */
export function pickSpawnPoint(randomPoint: () => Vec3, shipPosition: Vec3, minDistance: number): Vec3 {
  let point = randomPoint();
  for (let i = 0; i < 12; i++) {
    if (Math.hypot(point[0] - shipPosition[0], point[2] - shipPosition[2]) >= minDistance) return point;
    point = randomPoint();
  }
  return point;
}

export function spawnRoamer(position: Vec3, waypoint: Vec3, yaw: number, health: number): RoamerMotion {
  return { alive: true, health, position, yaw, bank: 0, waypoint, alarm: 0, respawn: 0, cooldown: 0 };
}

/** Revive a downed roamer in place: `position` and `waypoint` are already chosen. */
export function reviveRoamer(m: RoamerMotion, position: Vec3, waypoint: Vec3, health: number): void {
  m.alive = true;
  m.health = health;
  m.position = position;
  m.waypoint = waypoint;
  m.alarm = 0;
}

export function downRoamer(m: RoamerMotion, respawnDelay: number): void {
  m.alive = false;
  m.respawn = respawnDelay;
}

/** Counts down a dead roamer; true once it is time to revive. */
export function tickRespawn(m: RoamerMotion, delta: number): boolean {
  m.respawn -= delta;
  return m.respawn <= 0;
}

/**
 * One frame of a live roamer: notice threats, maybe shoot, steer toward the
 * waypoint, move. `randomPoint` supplies new waypoints.
 */
export function stepRoamer(
  m: RoamerMotion,
  senses: RoamerSenses,
  tuning: RoamerTuning,
  arenaRadius: number,
  fireInterval: number,
  delta: number,
  randomPoint: () => Vec3,
): RoamerStep {
  const { shipPosition } = senses;
  const shipDistance = Math.hypot(
    m.position[0] - shipPosition[0],
    m.position[1] - shipPosition[1],
    m.position[2] - shipPosition[2],
  );

  // Threats: the ship closing in, or a bolt passing nearby.
  if (shipDistance < tuning.scareDistance || senses.boltNear) {
    if (m.alarm <= 0) {
      m.waypoint = awayFrom(m.position, shipPosition, tuning.scatterDistance, arenaRadius * tuning.playFraction, randomPoint());
      m.cooldown = tuning.firstShotDelay;
    }
    m.alarm = tuning.alarmSeconds;
  }
  m.alarm = Math.max(0, m.alarm - delta);
  const scattering = m.alarm > 0;

  // Return fire while running, as long as the ship is in range.
  let fire = false;
  if (scattering && senses.shipLive && shipDistance < tuning.fireRange) {
    m.cooldown -= delta;
    if (m.cooldown <= 0) {
      fire = true;
      m.cooldown = fireInterval;
    }
  }

  // Steer toward the waypoint; pick a new one on arrival.
  const dx = m.waypoint[0] - m.position[0];
  const dz = m.waypoint[2] - m.position[2];
  if (Math.hypot(dx, dz) < tuning.waypointReach) m.waypoint = randomPoint();
  const desired = yawToward(m.position, m.waypoint);
  const turn = (scattering ? tuning.scatterTurn : tuning.cruiseTurn) * delta;
  const before = m.yaw;
  m.yaw = turnToward(m.yaw, desired, turn);
  const turning = wrapAngle(m.yaw - before) / Math.max(delta, 1e-6);

  const speed = scattering ? tuning.scatterSpeed : tuning.cruiseSpeed;
  m.position[0] += Math.sin(m.yaw) * speed * delta;
  m.position[2] += Math.cos(m.yaw) * speed * delta;
  // Ease altitude toward the waypoint's (exponential approach, 1/s).
  m.position[1] += (m.waypoint[1] - m.position[1]) * (1 - Math.exp(-delta));

  return { fire, turning };
}

/**
 * A waypoint `distance` away from the threat, clamped to `maxRadius`; falls
 * back to `fallback` if the roamer sits right on the threat.
 */
export function awayFrom(position: Vec3, threat: Vec3, distance: number, maxRadius: number, fallback: Vec3): Vec3 {
  const dx = position[0] - threat[0];
  const dz = position[2] - threat[2];
  const len = Math.hypot(dx, dz);
  if (len < 1e-3) return fallback;
  let x = position[0] + (dx / len) * distance;
  let z = position[2] + (dz / len) * distance;
  const r = Math.hypot(x, z);
  if (r > maxRadius) {
    x *= maxRadius / r;
    z *= maxRadius / r;
  }
  return [x, fallback[1], z];
}
