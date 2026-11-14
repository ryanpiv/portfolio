"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type * as THREE from "three";

import { railWaveTiming, railWaves, type WaveSpec } from "@data/lab";
import { projects } from "@data/projects";
import { segmentHitsSphere, spheresOverlap } from "@utils/collision";
import type { Vec3 } from "@utils/fieldLayout";
import { recordStat } from "@utils/progressStore";
import { dealIntoWaves } from "@utils/waveLayout";

import { useRail } from "./railContext";
import { buildWave } from "./buildWave";
import { fireShot } from "../game/fireShot";
import { applyDamage, isRunLive, recordEscape, recordHit, type GamePhase } from "./gameStore";
import type { Laser } from "../game/sim";
import { createDirector, stepDirector, type DirectorPhase } from "./waveDirector";
import { useGameFrame } from "../hooks/useGameFrame";
import { Enemy, type EnemySpawn } from "./Enemy";

/** An enemy has escaped once it is this far behind the camera. */
const ESCAPE_MARGIN = 6;
/** Vertical sway as a fraction of the lateral weave amplitude. */
const VERTICAL_WEAVE = 0.5;
/** Roll (rad) at the extreme of the weave. */
const WEAVE_BANK = 0.5;
/** Fighters only shoot while between these distances ahead of the ship. */
const FIRE_RANGE = { far: 110, near: 25 };
/** First shot comes this long after entering range; wingmen stagger behind the leader. */
const FIRST_SHOT_DELAY = 0.4;
const FIRE_STAGGER = 0.35;

type EnemyMotion = EnemySpawn & { alive: boolean; z: number; cooldown: number };

const GAME_PHASE: Record<DirectorPhase, GamePhase> = {
  briefing: "briefing",
  wave: "wave",
  between: "wave",
  complete: "complete",
};

/** Spawns waves from the table, flies them at the player, fires back, and resolves hits both ways. */
export function Enemies() {
  const { config, lighting, shipRef, simRef, store, progress } = useRail();
  const [roster, setRoster] = useState<EnemySpawn[]>([]);
  const dealt = useMemo(() => dealIntoWaves(projects, railWaves), []);

  // Per-frame state: only touched inside useGameFrame.
  const director = useRef(createDirector());
  const wave = useRef<WaveSpec | null>(null);
  const motion = useRef(new Map<string, EnemyMotion>());
  const groups = useRef(new Map<string, THREE.Group>());

  const register = useCallback((id: string, group: THREE.Group | null) => {
    if (group) groups.current.set(id, group);
    else groups.current.delete(id);
  }, []);

  useGameFrame(({ camera, clock }, delta) => {
    const ship = shipRef.current;
    if (!ship) return;
    const { combat, world, ship: shipConfig } = config;
    const sim = simRef.current;
    const motions = motion.current;
    const live = isRunLive(store.get().phase);
    const shipPos: Vec3 = [ship.position.x, ship.position.y, ship.position.z];

    if (live) {
      let active = 0;
      motions.forEach((m) => {
        if (m.alive) active++;
      });
      const step = stepDirector(director.current, delta, active > 0, railWaveTiming, railWaves.length);
      if (step.state !== director.current) {
        director.current = step.state;
        store.set({ phase: GAME_PHASE[step.state.phase], wave: step.state.wave });
        if (step.state.phase === "complete") {
          recordStat(progress, "railRunsCompleted");
          recordStat(progress, "points", config.scoring.missionComplete);
        }
      }
      if (step.spawn !== undefined) {
        const spec = railWaves[step.spawn];
        const anchor = { spawnDistance: combat.spawnDistance, altitude: shipConfig.altitude };
        const spawns = buildWave(step.spawn, spec, dealt[step.spawn], anchor);
        wave.current = spec;
        motions.clear();
        spawns.forEach((s, i) =>
          motions.set(s.id, { ...s, alive: true, z: s.start[2], cooldown: FIRST_SHOT_DELAY + i * FIRE_STAGGER }),
        );
        setRoster(spawns);
        return; // groups mount on the next render
      }
    }

    const spec = wave.current;
    if (!spec) return;
    const t = clock.elapsedTime;
    const closing = world.scrollSpeed + spec.approach;
    const removed: string[] = [];

    motions.forEach((m, id) => {
      if (!m.alive) return;
      m.z += closing * delta;
      const sway = Math.sin(t * spec.weave.frequency + m.phase);
      const x = m.offset[0] + sway * spec.weave.amplitude;
      const y =
        shipConfig.altitude +
        m.offset[1] +
        Math.cos(t * spec.weave.frequency * 0.7 + m.phase) * spec.weave.amplitude * VERTICAL_WEAVE;
      const center: Vec3 = [x, y, m.z];
      const color = lighting.statusColors[m.project.status];

      if (m.z > camera.position.z + ESCAPE_MARGIN) {
        m.alive = false;
        removed.push(id);
        recordEscape(store);
        return;
      }

      if (live && spheresOverlap(center, combat.enemyRadius, shipPos, combat.shipRadius)) {
        m.alive = false;
        removed.push(id);
        sim.bursts.push({ position: center, color });
        applyDamage(store, combat.ramDamage);
        return;
      }

      const bolt = sim.lasers.find((l) => l.active && boltHits(l, center, combat.enemyRadius));
      if (bolt) {
        bolt.active = false;
        m.alive = false;
        removed.push(id);
        sim.bursts.push({ position: center, color });
        recordHit(store, m.project.slug);
        recordStat(progress, "enemiesDestroyed");
        recordStat(progress, "damageDealt", bolt.damage);
        recordStat(progress, "points", config.scoring.kill);
        return;
      }

      const distance = -m.z;
      if (live && distance < FIRE_RANGE.far && distance > FIRE_RANGE.near) {
        m.cooldown -= delta;
        if (m.cooldown <= 0) {
          fireShot(sim.shots, center, shipPos, combat.enemyShotSpeed, world.scrollSpeed);
          m.cooldown = combat.enemyFireInterval;
        }
      }

      const group = groups.current.get(id);
      if (group) {
        group.position.set(x, y, m.z);
        group.rotation.z = -sway * WEAVE_BANK;
      }
    });

    if (removed.length) setRoster((list) => list.filter((e) => !removed.includes(e.id)));
  });

  return (
    <>
      {roster.map((spawn) => (
        <Enemy key={spawn.id} spawn={spawn} register={register} />
      ))}
    </>
  );
}

/** Swept test from where the bolt's tip was last frame to where it is now. */
function boltHits(bolt: Laser, center: Vec3, radius: number): boolean {
  return segmentHitsSphere(bolt.prev, bolt.position, center, radius);
}
