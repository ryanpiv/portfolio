"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type * as THREE from "three";

import { starFoxWaveTiming, starFoxWaves, type WaveSpec } from "@data/lab";
import { projects } from "@data/projects";
import { segmentHitsSphere } from "@utils/collision";
import type { Vec3 } from "@utils/fieldLayout";
import { dealIntoWaves } from "@utils/waveLayout";

import { useGame } from "../gameContext";
import { useGameFrame } from "../hooks/useGameFrame";
import { buildWave } from "../game/buildWave";
import type { GamePhase } from "../game/gameStore";
import type { Laser } from "../game/sim";
import { createDirector, stepDirector, type DirectorPhase } from "../game/waveDirector";
import { Enemy, type EnemySpawn } from "./Enemy";

/** An enemy has escaped once it is this far behind the camera. */
const ESCAPE_MARGIN = 6;
/** Vertical sway as a fraction of the lateral weave amplitude. */
const VERTICAL_WEAVE = 0.5;
/** Roll (rad) at the extreme of the weave. */
const WEAVE_BANK = 0.5;

type EnemyMotion = EnemySpawn & { alive: boolean; z: number };

const GAME_PHASE: Record<DirectorPhase, GamePhase> = {
  briefing: "briefing",
  wave: "wave",
  between: "wave",
  complete: "complete",
};

/** Spawns waves from the table, flies them at the player, and resolves laser hits. */
export function Enemies() {
  const { config, lighting, simRef, store } = useGame();
  const [roster, setRoster] = useState<EnemySpawn[]>([]);
  const dealt = useMemo(() => dealIntoWaves(projects, starFoxWaves), []);

  // Per-frame state: only touched inside useFrame.
  const director = useRef(createDirector());
  const wave = useRef<WaveSpec | null>(null);
  const motion = useRef(new Map<string, EnemyMotion>());
  const groups = useRef(new Map<string, THREE.Group>());

  const register = useCallback((id: string, group: THREE.Group | null) => {
    if (group) groups.current.set(id, group);
    else groups.current.delete(id);
  }, []);

  useGameFrame(({ camera, clock }, delta) => {
    const { combat, world, ship } = config;
    const motions = motion.current;
    let active = 0;
    motions.forEach((m) => {
      if (m.alive) active++;
    });

    const step = stepDirector(director.current, delta, active > 0, starFoxWaveTiming, starFoxWaves.length);
    if (step.state !== director.current) {
      director.current = step.state;
      store.set({ phase: GAME_PHASE[step.state.phase], wave: step.state.wave });
    }
    if (step.spawn !== undefined) {
      const spec = starFoxWaves[step.spawn];
      const anchor = { spawnDistance: combat.spawnDistance, altitude: ship.altitude };
      const spawns = buildWave(step.spawn, spec, dealt[step.spawn], anchor);
      wave.current = spec;
      motions.clear();
      spawns.forEach((s) => motions.set(s.id, { ...s, alive: true, z: s.start[2] }));
      setRoster(spawns);
      return; // groups mount on the next render
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
      const y = ship.altitude + m.offset[1] + Math.cos(t * spec.weave.frequency * 0.7 + m.phase) * spec.weave.amplitude * VERTICAL_WEAVE;
      const center: Vec3 = [x, y, m.z];

      if (m.z > camera.position.z + ESCAPE_MARGIN) {
        m.alive = false;
        removed.push(id);
        store.set((s) => ({ escaped: s.escaped + 1 }));
        return;
      }

      const bolt = simRef.current.lasers.find((l) => l.active && boltHits(l, center, combat.laserLength, combat.enemyRadius));
      if (bolt) {
        bolt.active = false;
        m.alive = false;
        removed.push(id);
        simRef.current.bursts.push({ position: center, color: lighting.statusColors[m.project.status] });
        store.set((s) => ({ hits: s.hits + 1 }));
        return;
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
function boltHits(bolt: Laser, center: Vec3, laserLength: number, radius: number): boolean {
  const [x, y, z] = bolt.position;
  return segmentHitsSphere([x, y, bolt.prevZ], [x, y, z - laserLength], center, radius);
}
