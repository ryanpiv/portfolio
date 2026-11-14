"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { createRng } from "@utils/fieldLayout";

import { useGame } from "../gameContext";

type Pillar = { x: number; z: number; w: number; h: number };

/** Clearance between the steering box edge and the nearest pillar face (the widest pillar is ~4.5). */
const LANE_MARGIN = 6;
const SPREAD = 70;
const dummy = new THREE.Object3D();

/** Low-poly pillars streaming past on both sides of the lane, recycled once behind the camera. */
export function Scenery() {
  const { config, lighting } = useGame();
  const mesh = useRef<THREE.InstancedMesh>(null);
  // Per-frame sim state; created lazily on first frame so nothing mutable is touched during render.
  const pillars = useRef<Pillar[] | null>(null);
  const { sceneryCount, drawDistance, scrollSpeed } = config.world;
  const laneHalfWidth = config.ship.halfWidth + LANE_MARGIN;

  useFrame(({ camera }, delta) => {
    const instanced = mesh.current;
    if (!instanced) return;
    pillars.current ??= seedPillars(sceneryCount, drawDistance, laneHalfWidth);

    const list = pillars.current;
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      p.z += scrollSpeed * delta;
      if (p.z > camera.position.z + 10) Object.assign(p, spawn(Math.random, -drawDistance, laneHalfWidth));
      dummy.position.set(p.x, p.h / 2, p.z);
      dummy.scale.set(p.w, p.h, p.w);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    }
    instanced.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, sceneryCount]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={lighting.ambient.color} roughness={0.9} metalness={0} />
    </instancedMesh>
  );
}

function seedPillars(count: number, drawDistance: number, laneHalfWidth: number): Pillar[] {
  const rng = createRng(7);
  return Array.from({ length: count }, () => spawn(rng, -rng() * drawDistance, laneHalfWidth));
}

function spawn(rng: () => number, z: number, laneHalfWidth: number): Pillar {
  const side = rng() < 0.5 ? -1 : 1;
  return {
    x: side * (laneHalfWidth + rng() * SPREAD),
    z,
    w: 1.5 + rng() * 3,
    h: 4 + rng() * 18,
  };
}
