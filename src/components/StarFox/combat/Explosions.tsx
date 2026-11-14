"use client";

import { useRef } from "react";
import * as THREE from "three";

import type { Vec3 } from "@utils/fieldLayout";

import { useGame } from "../gameContext";
import { useGameFrame } from "../hooks/useGameFrame";
import { hdrColor } from "./hdrColor";

const MAX_PARTICLES = 160;
const PARTICLES_PER_BURST = 14;
/** Seconds a shard lives; it shrinks to nothing over this time. */
const SHARD_LIFE = 0.8;
const SHARD_SIZE = 0.5;
/** Ejection speed range, world units / s. */
const SHARD_SPEED: [min: number, max: number] = [5, 14];

type Shard = { life: number; position: Vec3; velocity: Vec3 };

const dummy = new THREE.Object3D();
const white = new THREE.Color("#ffffff");

/** Pooled debris bursts, fed from `sim.bursts`. Shards inherit the world scroll so they stream past. */
export function Explosions() {
  const { scrollSpeed, lighting, simRef } = useGame();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const shards = useRef<Shard[] | null>(null);
  const { glowGain } = lighting;

  useGameFrame((_, delta) => {
    const instanced = mesh.current;
    if (!instanced) return;
    if (!shards.current) {
      shards.current = Array.from({ length: MAX_PARTICLES }, () => ({ life: 0, position: [0, 0, 0], velocity: [0, 0, 0] }));
      for (let i = 0; i < MAX_PARTICLES; i++) instanced.setColorAt(i, white);
    }
    const list = shards.current;

    const { bursts } = simRef.current;
    while (bursts.length) {
      const burst = bursts.pop()!;
      const color = hdrColor(burst.color, glowGain);
      const count = Math.round(PARTICLES_PER_BURST * (burst.size ?? 1));
      let spawned = 0;
      for (let i = 0; i < list.length && spawned < count; i++) {
        if (list[i].life > 0) continue;
        list[i] = { life: SHARD_LIFE, position: [...burst.position], velocity: ejection(scrollSpeed) };
        instanced.setColorAt(i, color);
        spawned++;
      }
    }

    for (let i = 0; i < list.length; i++) {
      const shard = list[i];
      if (shard.life > 0) {
        shard.life -= delta;
        shard.position[0] += shard.velocity[0] * delta;
        shard.position[1] += shard.velocity[1] * delta;
        shard.position[2] += shard.velocity[2] * delta;
        dummy.position.set(shard.position[0], shard.position[1], shard.position[2]);
        dummy.rotation.set(shard.life * 7, shard.life * 5, 0);
        dummy.scale.setScalar(SHARD_SIZE * Math.max(shard.life, 0) / SHARD_LIFE);
      } else {
        dummy.scale.setScalar(0);
      }
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    }
    instanced.instanceMatrix.needsUpdate = true;
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MAX_PARTICLES]} frustumCulled={false}>
      <tetrahedronGeometry args={[1, 0]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

/** Random direction scaled into the speed range, plus the world scroll on z. */
function ejection(scrollSpeed: number): Vec3 {
  const theta = Math.random() * Math.PI * 2;
  const z = Math.random() * 2 - 1;
  const r = Math.sqrt(1 - z * z);
  const speed = SHARD_SPEED[0] + Math.random() * (SHARD_SPEED[1] - SHARD_SPEED[0]);
  return [Math.cos(theta) * r * speed, Math.sin(theta) * r * speed, z * speed + scrollSpeed];
}
