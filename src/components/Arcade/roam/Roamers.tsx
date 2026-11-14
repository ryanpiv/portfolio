"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";

import { Nameplate } from "@components/LabScene";
import { projects, type Project } from "@data/projects";
import { segmentHitsSphere } from "@utils/collision";
import { createRng, type Vec3 } from "@utils/fieldLayout";
import { recordStat, type ProgressStore } from "@utils/progressStore";

import { EnemyModel } from "../entities/EnemyModel";
import { fireShot } from "../game/fireShot";
import type { Sim } from "../game/sim";
import { useGameFrame } from "../hooks/useGameFrame";
import { useGroupRegistry, type RegisterGroup } from "../hooks/useGroupRegistry";
import { useRoam } from "./roamContext";
import {
  downRoamer,
  pickSpawnPoint,
  randomRoamPoint,
  reviveRoamer,
  spawnRoamer,
  stepRoamer,
  tickRespawn,
  type RoamerMotion,
} from "./roamerBrain";
import { recordKill } from "./roamStore";

const ROAMER_SCALE = 1.5;
const PLATE_RADIUS = 1;
const PLATE_DISTANCE = 50;
/** Rolls the model into turns. */
const BANK = 0.6;
const BANK_LAMBDA = 6;
/** Debris multiplier for a bolt that chips but does not kill. */
const CHIP_BURST_SIZE = 0.3;

type RoamerSpawn = { id: string; project: Project };

/**
 * Fighters that wander between waypoints, scatter and shoot back when the
 * ship or a bolt gets close, and respawn a few seconds after being shot
 * down. Left alone they are harmless; the arena is a project explorer first.
 * The rules live in `roamerBrain`; this component owns the objects and sim.
 */
export function Roamers() {
  const { config, combat, lighting, shipRef, simRef, store, progress, radarRef, isLive } = useRoam();
  const { roamerCount, radius, seed } = config.arena;
  const { roamerHealth } = config.hull;
  const tuning = config.roamers;
  const rng = useMemo(() => createRng(seed * 7919), [seed]);
  const roster = useMemo<RoamerSpawn[]>(
    () => Array.from({ length: roamerCount }, (_, i) => ({ id: `roamer-${i}`, project: projects[i % projects.length] })),
    [roamerCount],
  );

  const motion = useRef(new Map<string, RoamerMotion>());
  const { groups, register } = useGroupRegistry();

  useGameFrame((_, delta) => {
    const ship = shipRef.current;
    if (!ship) return;
    const sim = simRef.current;
    const shipPosition: Vec3 = [ship.position.x, ship.position.y, ship.position.z];
    const hitRadius = combat.enemyRadius * ROAMER_SCALE;
    const shipLive = isLive();
    const blips = radarRef.current.roamers;
    blips.length = 0;

    const randomPoint = () => randomRoamPoint(rng, tuning, radius);
    const spawnPoint = () => pickSpawnPoint(randomPoint, shipPosition, tuning.respawnMinDistance);

    for (const spawn of roster) {
      const group = groups.current.get(spawn.id);
      if (!group) continue;
      let m = motion.current.get(spawn.id);
      if (!m) {
        m = spawnRoamer(spawnPoint(), randomPoint(), rng() * Math.PI * 2, roamerHealth);
        motion.current.set(spawn.id, m);
      }

      if (!m.alive) {
        if (!tickRespawn(m, delta)) continue;
        reviveRoamer(m, spawnPoint(), randomPoint(), roamerHealth);
        group.visible = true;
      }

      const boltNear = sim.lasers.some((l) => l.active && segmentHitsSphere(l.prev, l.position, m.position, tuning.boltScareDistance));
      const step = stepRoamer(m, { shipPosition, boltNear, shipLive }, tuning, radius, combat.enemyFireInterval, delta, randomPoint);
      if (step.fire) fireShot(sim.shots, m.position, shipPosition, combat.enemyShotSpeed);

      const color = lighting.statusColors[spawn.project.status];
      if (takeBoltHits(m, sim, progress, hitRadius, color)) {
        downRoamer(m, tuning.respawnDelay);
        group.visible = false;
        sim.bursts.push({ position: [...m.position], color });
        recordKill(store, config.scoring.kill);
        recordStat(progress, "enemiesDestroyed");
        recordStat(progress, "points", config.scoring.kill);
        continue;
      }

      m.bank = THREE.MathUtils.damp(m.bank, -THREE.MathUtils.clamp(step.turning, -1, 1) * BANK, BANK_LAMBDA, delta);
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

/** Every bolt that lands chips health and sparks; returns true on the killing hit. */
function takeBoltHits(m: RoamerMotion, sim: Sim, progress: ProgressStore, hitRadius: number, color: string): boolean {
  for (const bolt of sim.lasers) {
    if (!bolt.active || !segmentHitsSphere(bolt.prev, bolt.position, m.position, hitRadius)) continue;
    bolt.active = false;
    const dealt = Math.min(bolt.damage, m.health);
    m.health -= dealt;
    recordStat(progress, "damageDealt", dealt);
    if (m.health <= 0) return true;
    sim.bursts.push({ position: [...bolt.position], color, size: CHIP_BURST_SIZE });
  }
  return false;
}

type RoamerProps = {
  spawn: RoamerSpawn;
  register: RegisterGroup;
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
