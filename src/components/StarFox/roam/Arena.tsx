"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { weapons } from "@data/lab";
import type { Building } from "@utils/arenaLayout";
import { segmentHitsAabb } from "@utils/collision";
import { recordStat } from "@utils/progressStore";

import { useGameFrame } from "../hooks/useGameFrame";
import { useRoam } from "./roamContext";
import { recordTower } from "./roamStore";

const GRID_DIVISIONS = 60;
/** Ground extends past the playable radius so the edge never shows. */
const GROUND_OVERSHOOT = 1.4;
const BOUNDARY_SEGMENTS = 96;
const BOUNDARY_HEIGHT = 1.5;
/** Towers sit this far from the background toward the text color: present, not loud. */
const TOWER_TINT = 0.1;

const dummy = new THREE.Object3D();

/** Static arena: grid floor, a faint boundary ring at the playable radius, and the instanced towers. */
export function Arena() {
  const { config, lighting, layout } = useRoam();
  const { radius } = config.arena;
  const size = radius * 2 * GROUND_OVERSHOOT;
  const line = lighting.core.color;

  return (
    <group>
      <gridHelper
        args={[size, GRID_DIVISIONS, line, line]}
        position={[0, 0.01, 0]}
        material-transparent
        material-opacity={0.22}
        material-depthWrite={false}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <shadowMaterial color={lighting.background} opacity={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial color={lighting.background} />
      </mesh>
      <mesh position={[0, BOUNDARY_HEIGHT, 0]}>
        <cylinderGeometry args={[radius, radius, BOUNDARY_HEIGHT * 2, BOUNDARY_SEGMENTS, 1, true]} />
        <meshBasicMaterial
          color={lighting.statusColors.showcase}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <Buildings buildings={layout.buildings} />
    </group>
  );
}

type BuildingsProps = { buildings: ReadonlyArray<Building> };

/** Towers shrink out over this long when destroyed. */
const COLLAPSE_S = 0.5;
/** Debris size for a felled tower, relative to a fighter. */
const COLLAPSE_BURST = 4;

/**
 * One instanced mesh for every tower. Bolts stop on towers; heavy ones
 * (plasma) take health off them, and a tower with none left collapses.
 */
function Buildings({ buildings }: BuildingsProps) {
  const { lighting, simRef, progress, config, arenaRef, store } = useRoam();
  const mesh = useRef<THREE.InstancedMesh>(null);
  /** Per-tower collapse progress in [0, 1]; absent while standing. */
  const collapsing = useRef(new Map<number, number>());
  const hull = useMemo(
    () => new THREE.Color(lighting.background).lerp(new THREE.Color(lighting.text), TOWER_TINT),
    [lighting],
  );

  useEffect(() => {
    const instanced = mesh.current;
    if (!instanced) return;
    buildings.forEach((b, i) => writeTower(instanced, i, b, 1));
    instanced.count = buildings.length;
    instanced.instanceMatrix.needsUpdate = true;
  }, [buildings]);

  useGameFrame((_, delta) => {
    const instanced = mesh.current;
    if (!instanced) return;
    const sim = simRef.current;
    const { towers } = arenaRef.current;
    let dirty = false;

    for (let b = 0; b < sim.lasers.length; b++) {
      const bolt = sim.lasers[b];
      if (!bolt.active) continue;
      for (let i = 0; i < towers.length; i++) {
        const tower = towers[i];
        if (!tower.alive) continue;
        const hit = segmentHitsAabb(bolt.prev, bolt.position, tower.box);
        if (!hit) continue;
        bolt.active = false;
        const color = lighting.statusColors[weapons[bolt.weapon].color];
        if (bolt.heavy) {
          const dealt = Math.min(bolt.damage, tower.health);
          tower.health -= dealt;
          recordStat(progress, "damageDealt", dealt);
          sim.bursts.push({ position: hit, color, size: 1 });
          if (tower.health <= 0) {
            tower.alive = false;
            collapsing.current.set(i, 0);
            sim.bursts.push({ position: tower.center, color, size: COLLAPSE_BURST });
            recordTower(store, config.scoring.tower);
            recordStat(progress, "towersDestroyed");
            recordStat(progress, "points", config.scoring.tower);
          }
        } else {
          sim.bursts.push({ position: hit, color, size: 0.2 });
        }
        break;
      }
    }

    collapsing.current.forEach((t, i) => {
      const next = Math.min(1, t + delta / COLLAPSE_S);
      writeTower(instanced, i, buildings[i], 1 - next);
      dirty = true;
      if (next >= 1) collapsing.current.delete(i);
      else collapsing.current.set(i, next);
    });
    if (dirty) instanced.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, Math.max(1, buildings.length)]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hull} roughness={0.85} metalness={0.1} />
    </instancedMesh>
  );
}

/** Writes a tower's matrix at `scale` of its full height (1 = standing, 0 = gone). */
function writeTower(instanced: THREE.InstancedMesh, index: number, b: Building, scale: number) {
  dummy.position.set(b.position[0], (b.size[1] * scale) / 2, b.position[2]);
  dummy.scale.set(b.size[0] * scale, b.size[1] * scale, b.size[2] * scale);
  dummy.updateMatrix();
  instanced.setMatrixAt(index, dummy.matrix);
}
