"use client";

import type * as THREE from "three";

import { Nameplate } from "@components/LabScene";
import type { Project } from "@data/projects";
import type { Vec3 } from "@utils/fieldLayout";

import { useRail } from "./railContext";
import { EnemyModel } from "../entities/EnemyModel";

export type EnemySpawn = {
  id: string;
  project: Project;
  /** Formation offset from the wave anchor. */
  offset: Vec3;
  /** Weave phase so the formation does not sway in lockstep. */
  phase: number;
  /** World position at spawn. */
  start: Vec3;
};

type EnemyProps = {
  spawn: EnemySpawn;
  /** Called with the group on mount and `null` on unmount. */
  register: (id: string, group: THREE.Group | null) => void;
};

/** Model scale; the hit sphere is `config.combat.enemyRadius`, independent of this. */
const ENEMY_SCALE = 1.5;
/** Visual radius (in model units) used to hang the nameplate. */
const PLATE_RADIUS = 1;
/** Nameplates are full size this far from the camera, and shrink beyond it. */
const PLATE_DISTANCE = 40;

/** One fighter carrying a project's title and status color. Motion is driven by `Enemies`. */
export function Enemy({ spawn, register }: EnemyProps) {
  const { lighting } = useRail();
  const color = lighting.statusColors[spawn.project.status];

  return (
    <group
      position={spawn.start}
      scale={ENEMY_SCALE}
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
