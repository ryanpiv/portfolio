"use client";

import { useCallback, useMemo, useRef } from "react";
import * as THREE from "three";

import { Nameplate } from "@components/LabScene";
import { projects, type Project } from "@data/projects";
import { segmentHitsSphere } from "@utils/collision";
import { createRng, type Vec3 } from "@utils/fieldLayout";
import { recordStat } from "@utils/progressStore";

import { EnemyModel } from "../entities/EnemyModel";
import { fireShot } from "../game/fireShot";
import { turnToward, wrapAngle, yawToward } from "../game/steering";
import { useGameFrame } from "../hooks/useGameFrame";
import { useRoam } from "./roamContext";
import { recordKill } from "./roamStore";

/** Roamers cruise above the towers. */
const ALTITUDE: [number, number] = [22, 58];
const CRUISE_SPEED = 14;
const SCATTER_SPEED = 34;
const CRUISE_TURN = 1.2;
const SCATTER_TURN = 2.6;
/** Within this of a waypoint counts as arrived. */
const WAYPOINT_REACH = 10;
/** The ship this close, or a bolt this close, spooks a roamer. */
const SCARE_DISTANCE = 32;
const BOLT_SCARE_DISTANCE = 8;
/** How long a spooked roamer keeps running. */
const ALARM_S = 3;
/** Spooked roamers shoot back while the ship is within this range. */
const FIRE_RANGE = 120;
/** Head start before a freshly spooked roamer opens fire. */
const FIRST_SHOT_DELAY = 0.6;
/** Downtime between a kill and the fighter re-entering. */
const RESPAWN_S = 4;
/** Fresh spawns and scatter targets land in this fraction of the arena. */
const PLAY_FRACTION = 0.85;
const SCATTER_DISTANCE = 70;
/** Respawns appear at least this far from the ship. */
const RESPAWN_MIN_DISTANCE = 90;
const ROAMER_SCALE = 1.5;
const PLATE_RADIUS = 1;
const PLATE_DISTANCE = 50;
/** Rolls the model into turns. */
const BANK = 0.6;
const BANK_LAMBDA = 6;

type RoamerSpawn = { id: string; project: Project };

type RoamerMotion = {
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

/**
 * Fighters that wander between waypoints, scatter and shoot back when the
 * ship or a bolt gets close, and respawn a few seconds after being shot
 * down. Left alone they are harmless; the arena is a project explorer first.
 */
export function Roamers() {
  const { config, combat, lighting, shipRef, simRef, store, progress, radarRef, isLive } = useRoam();
  const { roamerCount, radius, seed } = config.arena;
  const { roamerHealth } = config.hull;
  const rng = useMemo(() => createRng(seed * 7919), [seed]);
  const roster = useMemo<RoamerSpawn[]>(
    () => Array.from({ length: roamerCount }, (_, i) => ({ id: `roamer-${i}`, project: projects[i % projects.length] })),
    [roamerCount],
  );

  const motion = useRef(new Map<string, RoamerMotion>());
  const groups = useRef(new Map<string, THREE.Group>());

  const register = useCallback((id: string, group: THREE.Group | null) => {
    if (group) groups.current.set(id, group);
    else groups.current.delete(id);
  }, []);

  const randomPoint = (): Vec3 => {
    const angle = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * radius * PLAY_FRACTION;
    return [Math.cos(angle) * r, ALTITUDE[0] + rng() * (ALTITUDE[1] - ALTITUDE[0]), Math.sin(angle) * r];
  };

  const spawnPoint = (shipPos: Vec3): Vec3 => {
    for (let i = 0; i < 12; i++) {
      const p = randomPoint();
      if (Math.hypot(p[0] - shipPos[0], p[2] - shipPos[2]) >= RESPAWN_MIN_DISTANCE) return p;
    }
    return randomPoint();
  };

  useGameFrame((_, delta) => {
    const ship = shipRef.current;
    if (!ship) return;
    const sim = simRef.current;
    const shipPos: Vec3 = [ship.position.x, ship.position.y, ship.position.z];
    const hitRadius = combat.enemyRadius * ROAMER_SCALE;
    const live = isLive();
    const blips = radarRef.current.roamers;
    blips.length = 0;

    for (const spawn of roster) {
      const group = groups.current.get(spawn.id);
      if (!group) continue;
      let m = motion.current.get(spawn.id);
      if (!m) {
        const position = spawnPoint(shipPos);
        m = {
          alive: true,
          health: roamerHealth,
          position,
          yaw: rng() * Math.PI * 2,
          bank: 0,
          waypoint: randomPoint(),
          alarm: 0,
          respawn: 0,
          cooldown: 0,
        };
        motion.current.set(spawn.id, m);
      }
      const self = m;

      if (!m.alive) {
        m.respawn -= delta;
        if (m.respawn <= 0) {
          m.alive = true;
          m.health = roamerHealth;
          m.position = spawnPoint(shipPos);
          m.waypoint = randomPoint();
          m.alarm = 0;
          group.visible = true;
        } else {
          continue;
        }
      }

      // Threats: the ship closing in, or a bolt passing nearby.
      const shipDistance = Math.hypot(m.position[0] - shipPos[0], m.position[1] - shipPos[1], m.position[2] - shipPos[2]);
      const boltNear = sim.lasers.some(
        (l) => l.active && segmentHitsSphere(l.prev, l.position, self.position, BOLT_SCARE_DISTANCE),
      );
      if (shipDistance < SCARE_DISTANCE || boltNear) {
        if (m.alarm <= 0) {
          m.waypoint = awayFrom(m.position, shipPos, radius * PLAY_FRACTION, randomPoint());
          m.cooldown = FIRST_SHOT_DELAY;
        }
        m.alarm = ALARM_S;
      }
      m.alarm = Math.max(0, m.alarm - delta);
      const scattering = m.alarm > 0;

      // Return fire while running, as long as the ship is in range.
      if (scattering && live && shipDistance < FIRE_RANGE) {
        m.cooldown -= delta;
        if (m.cooldown <= 0) {
          fireShot(sim.shots, m.position, shipPos, combat.enemyShotSpeed);
          m.cooldown = combat.enemyFireInterval;
        }
      }

      // Steer toward the waypoint; pick a new one on arrival.
      const dx = m.waypoint[0] - m.position[0];
      const dz = m.waypoint[2] - m.position[2];
      if (Math.hypot(dx, dz) < WAYPOINT_REACH) m.waypoint = randomPoint();
      const desired = yawToward(m.position, m.waypoint);
      const turn = (scattering ? SCATTER_TURN : CRUISE_TURN) * delta;
      const before = m.yaw;
      m.yaw = turnToward(m.yaw, desired, turn);
      const turning = wrapAngle(m.yaw - before) / Math.max(delta, 1e-6);

      const speed = scattering ? SCATTER_SPEED : CRUISE_SPEED;
      m.position[0] += Math.sin(m.yaw) * speed * delta;
      m.position[2] += Math.cos(m.yaw) * speed * delta;
      m.position[1] = THREE.MathUtils.damp(m.position[1], m.waypoint[1], 1, delta);

      // Hits: every bolt that lands chips health; the killing one gets the burst.
      const color = lighting.statusColors[spawn.project.status];
      let downed = false;
      for (let b = 0; b < sim.lasers.length; b++) {
        const bolt = sim.lasers[b];
        if (!bolt.active || !segmentHitsSphere(bolt.prev, bolt.position, self.position, hitRadius)) continue;
        bolt.active = false;
        const dealt = Math.min(bolt.damage, m.health);
        m.health -= dealt;
        recordStat(progress, "damageDealt", dealt);
        if (m.health <= 0) {
          downed = true;
          break;
        }
        sim.bursts.push({ position: [...bolt.position], color, size: 0.3 });
      }
      if (downed) {
        m.alive = false;
        m.respawn = RESPAWN_S;
        group.visible = false;
        sim.bursts.push({ position: [...m.position], color });
        recordKill(store, config.scoring.kill);
        recordStat(progress, "enemiesDestroyed");
        recordStat(progress, "points", config.scoring.kill);
        continue;
      }

      m.bank = THREE.MathUtils.damp(m.bank, -THREE.MathUtils.clamp(turning, -1, 1) * BANK, BANK_LAMBDA, delta);
      group.position.set(m.position[0], m.position[1], m.position[2]);
      group.rotation.set(0, m.yaw, m.bank, "YXZ");
      blips.push({ x: m.position[0], z: m.position[2], color });
    }
  });

  return (
    <>
      {roster.map((spawn) => (
        <Roamer key={spawn.id} spawn={spawn} register={register} />
      ))}
    </>
  );
}

type RoamerProps = {
  spawn: RoamerSpawn;
  register: (id: string, group: THREE.Group | null) => void;
};

function Roamer({ spawn, register }: RoamerProps) {
  const { lighting } = useRoam();
  const color = lighting.statusColors[spawn.project.status];
  return (
    <group
      scale={ROAMER_SCALE}
      position={[0, -100, 0]}
      ref={(group) => {
        register(spawn.id, group);
        return () => register(spawn.id, null);
      }}
    >
      <EnemyModel color={color} hull={lighting.core.color} glowGain={lighting.glowGain} />
      <Nameplate label={spawn.project.title} radius={PLATE_RADIUS} color={color} distanceFactor={PLATE_DISTANCE} />
    </group>
  );
}

/** A waypoint `SCATTER_DISTANCE` away from the threat, clamped to the play radius; falls back to `fallback` if the roamer sits on the threat. */
function awayFrom(position: Vec3, threat: Vec3, maxRadius: number, fallback: Vec3): Vec3 {
  const dx = position[0] - threat[0];
  const dz = position[2] - threat[2];
  const len = Math.hypot(dx, dz);
  if (len < 1e-3) return fallback;
  let x = position[0] + (dx / len) * SCATTER_DISTANCE;
  let z = position[2] + (dz / len) * SCATTER_DISTANCE;
  const r = Math.hypot(x, z);
  if (r > maxRadius) {
    x *= maxRadius / r;
    z *= maxRadius / r;
  }
  return [x, fallback[1], z];
}
