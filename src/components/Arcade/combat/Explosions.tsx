"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";

import type { Vec3 } from "@utils/fieldLayout";

import { useGame } from "../gameContext";
import type { Burst } from "../game/sim";
import { useGameFrame } from "../hooks/useGameFrame";
import { hdrColor } from "./hdrColor";

/**
 * Pooled explosion layers, all fed from `sim.bursts`. A burst's `size`
 * (1 = a fighter) decides what it gets:
 *
 * - any size: sparks (bright shards) and a quick flash
 * - size ≥ 1: a shockwave ring and smoke that drifts up and fades
 * - `rubble`: lit chunks that tumble under gravity and settle on the ground
 *
 * Rings and smoke are part of the "trails & shockwaves" effect toggle; the
 * flash and sparks always play so a hit still reads.
 */

const SPARK_POOL = 220;
const SPARKS_PER_BURST = 14;
const SPARK_LIFE = 0.8;
const SPARK_SIZE = 0.5;
const SPARK_SPEED: [number, number] = [5, 15];
const SPARK_GRAVITY = 9;

const RUBBLE_POOL = 90;
const RUBBLE_LIFE = 3.2;
const RUBBLE_SPEED: [number, number] = [3, 11];
const RUBBLE_GRAVITY = 22;
/** Fraction of speed kept on a ground bounce. */
const RUBBLE_BOUNCE = 0.35;
const RUBBLE_FRICTION = 0.7;
/** Chunk size relative to the burst's size. */
const RUBBLE_SCALE: [number, number] = [0.6, 1.6];

const FLASH_POOL = 12;
const FLASH_LIFE = 0.16;
/** Flash radius at full size, times the burst size. */
const FLASH_RADIUS = 2.2;

const RING_POOL = 12;
const RING_LIFE = 0.5;
const RING_RADIUS = 6;

const SMOKE_POOL = 48;
const SMOKE_PER_BURST = 4;
const SMOKE_LIFE = 1.8;
const SMOKE_RADIUS: [number, number] = [0.8, 2.2];
const SMOKE_RISE = 2.5;
const SMOKE_TINT = 0.12;

/** Bursts at least this big ask for a real light. */
const LIGHT_MIN_SIZE = 1;
const LIGHT_INTENSITY = 220;
const LIGHT_SECONDS = 0.35;

type Mote = { life: number; max: number; position: Vec3; velocity: Vec3; scale: number; spin: number };

const dummy = new THREE.Object3D();
const white = new THREE.Color("#ffffff");
const scratch = new THREE.Color();
const UP = new THREE.Vector3(0, 1, 0);
const FLAT = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), UP);

function makePool(count: number): Mote[] {
  return Array.from({ length: count }, () => ({ life: 0, max: 1, position: [0, 0, 0], velocity: [0, 0, 0], scale: 1, spin: 0 }));
}

/** Index of a free mote, or -1 when the pool is spent. */
function take(pool: Mote[]): number {
  for (let i = 0; i < pool.length; i++) if (pool[i].life <= 0) return i;
  return -1;
}

function start(mote: Mote, life: number, position: Vec3, velocity: Vec3, scale: number) {
  mote.life = life;
  mote.max = life;
  mote.position = [...position];
  mote.velocity = velocity;
  mote.scale = scale;
  mote.spin = Math.random() * Math.PI * 2;
}

/** Random direction scaled into the speed range, plus the world scroll on z. */
function ejection([lo, hi]: [number, number], scrollSpeed: number, upBias = 0): Vec3 {
  const theta = Math.random() * Math.PI * 2;
  const z = Math.random() * 2 - 1;
  const r = Math.sqrt(1 - z * z);
  const speed = lo + Math.random() * (hi - lo);
  return [Math.cos(theta) * r * speed, Math.sin(theta) * r * speed + upBias * speed, z * speed + scrollSpeed];
}

function scatter(position: Vec3, extent: Vec3 | undefined): Vec3 {
  if (!extent) return [...position];
  return [
    position[0] + (Math.random() - 0.5) * extent[0],
    position[1] + (Math.random() - 0.5) * extent[1],
    position[2] + (Math.random() - 0.5) * extent[2],
  ];
}

export function Explosions() {
  const { scrollSpeed, lighting, simRef, effects } = useGame();
  const sparkMesh = useRef<THREE.InstancedMesh>(null);
  const rubbleMesh = useRef<THREE.InstancedMesh>(null);
  const flashMesh = useRef<THREE.InstancedMesh>(null);
  const ringMesh = useRef<THREE.InstancedMesh>(null);
  const smokeMesh = useRef<THREE.InstancedMesh>(null);
  const pools = useRef({
    sparks: makePool(SPARK_POOL),
    rubble: makePool(RUBBLE_POOL),
    flashes: makePool(FLASH_POOL),
    rings: makePool(RING_POOL),
    smoke: makePool(SMOKE_POOL),
  });
  const { glowGain } = lighting;
  const rubbleColor = useMemo(
    () => new THREE.Color(lighting.background).lerp(new THREE.Color(lighting.text), 0.3),
    [lighting],
  );
  const smokeFrom = useMemo(
    () => new THREE.Color(lighting.background).lerp(new THREE.Color(lighting.text), SMOKE_TINT),
    [lighting],
  );
  const smokeTo = useMemo(() => new THREE.Color(lighting.background), [lighting]);
  const trails = effects.trails;

  useGameFrame(({ camera }, delta) => {
    const sparks = sparkMesh.current;
    const rubble = rubbleMesh.current;
    const flashes = flashMesh.current;
    const rings = ringMesh.current;
    const smoke = smokeMesh.current;
    if (!sparks || !rubble || !flashes || !rings || !smoke) return;
    const P = pools.current;
    const sim = simRef.current;

    const meshes = { sparks, flashes, rings };
    while (sim.bursts.length) {
      spawn(sim.bursts.pop()!, meshes);
    }

    function spawn(burst: Burst, { sparks, flashes, rings }: typeof meshes) {
      const size = burst.size ?? 1;
      const color = hdrColor(burst.color, glowGain);

      const sparkCount = Math.round(SPARKS_PER_BURST * Math.min(size, 3));
      for (let n = 0; n < sparkCount; n++) {
        const i = take(P.sparks);
        if (i < 0) break;
        start(P.sparks[i], SPARK_LIFE * (0.7 + Math.random() * 0.5), scatter(burst.position, burst.extent), ejection(SPARK_SPEED, scrollSpeed), SPARK_SIZE * Math.min(size, 2));
        sparks.setColorAt(i, color);
      }

      const f = take(P.flashes);
      if (f >= 0) {
        start(P.flashes[f], FLASH_LIFE, burst.position, [0, 0, scrollSpeed], FLASH_RADIUS * Math.max(size, 0.4));
        flashes.setColorAt(f, color);
      }

      if (size >= LIGHT_MIN_SIZE) {
        sim.flashes.push({ position: [...burst.position], color: burst.color, intensity: LIGHT_INTENSITY * size, duration: LIGHT_SECONDS });
      }

      if (trails && size >= 1) {
        const r = take(P.rings);
        if (r >= 0) {
          start(P.rings[r], RING_LIFE, burst.ground ? [burst.position[0], 0.3, burst.position[2]] : burst.position, [0, 0, scrollSpeed], RING_RADIUS * size);
          P.rings[r].spin = burst.ground ? 1 : 0;
          rings.setColorAt(r, color);
        }
        const puffs = Math.round(SMOKE_PER_BURST * Math.min(size, 3));
        for (let n = 0; n < puffs; n++) {
          const i = take(P.smoke);
          if (i < 0) break;
          const radius = (SMOKE_RADIUS[0] + Math.random() * (SMOKE_RADIUS[1] - SMOKE_RADIUS[0])) * Math.min(size, 3);
          start(P.smoke[i], SMOKE_LIFE * (0.8 + Math.random() * 0.4), scatter(burst.position, burst.extent), ejection([0.5, 2.5], scrollSpeed, 1), radius);
        }
      }

      for (let n = 0; n < (burst.rubble ?? 0); n++) {
        const i = take(P.rubble);
        if (i < 0) break;
        const chunk = RUBBLE_SCALE[0] + Math.random() * (RUBBLE_SCALE[1] - RUBBLE_SCALE[0]);
        start(P.rubble[i], RUBBLE_LIFE * (0.8 + Math.random() * 0.4), scatter(burst.position, burst.extent), ejection(RUBBLE_SPEED, scrollSpeed, 0.6), chunk * Math.min(size, 3) * 0.5);
      }
    }

    // Sparks: fall a little, shrink to nothing.
    for (let i = 0; i < P.sparks.length; i++) {
      const m = P.sparks[i];
      if (m.life > 0) {
        m.life -= delta;
        m.velocity[1] -= SPARK_GRAVITY * delta;
        advance(m, delta);
        dummy.position.set(m.position[0], m.position[1], m.position[2]);
        dummy.rotation.set(m.life * 7, m.life * 5 + m.spin, 0);
        dummy.scale.setScalar((m.scale * Math.max(m.life, 0)) / m.max);
      } else dummy.scale.setScalar(0);
      dummy.updateMatrix();
      sparks.setMatrixAt(i, dummy.matrix);
    }

    // Rubble: tumble, fall, bounce on the ground, settle, then sink away.
    for (let i = 0; i < P.rubble.length; i++) {
      const m = P.rubble[i];
      if (m.life > 0) {
        m.life -= delta;
        m.velocity[1] -= RUBBLE_GRAVITY * delta;
        advance(m, delta);
        const floor = m.scale / 2;
        if (m.position[1] < floor) {
          m.position[1] = floor;
          if (m.velocity[1] < 0) m.velocity[1] = -m.velocity[1] * RUBBLE_BOUNCE;
          m.velocity[0] *= RUBBLE_FRICTION;
          m.velocity[2] *= RUBBLE_FRICTION;
        }
        const moving = Math.hypot(m.velocity[0], m.velocity[1], m.velocity[2]) > 0.5;
        const fade = Math.min(1, m.life / 0.5);
        dummy.position.set(m.position[0], m.position[1] - (1 - fade) * floor, m.position[2]);
        if (moving) dummy.rotation.set(m.life * 3 + m.spin, m.life * 2, m.spin);
        dummy.scale.set(m.scale, m.scale * 0.7, m.scale * 1.2);
      } else dummy.scale.setScalar(0);
      dummy.updateMatrix();
      rubble.setMatrixAt(i, dummy.matrix);
    }

    // Flash: a glowing sphere that pops out and dies in a few frames.
    for (let i = 0; i < P.flashes.length; i++) {
      const m = P.flashes[i];
      if (m.life > 0) {
        m.life -= delta;
        advance(m, delta);
        const t = 1 - Math.max(m.life, 0) / m.max;
        dummy.position.set(m.position[0], m.position[1], m.position[2]);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(m.scale * (0.4 + 0.6 * Math.sqrt(t)) * (1 - t * t));
      } else dummy.scale.setScalar(0);
      dummy.updateMatrix();
      flashes.setMatrixAt(i, dummy.matrix);
    }

    // Rings: expand fast, thin out; ground rings lie flat, the rest face the camera.
    for (let i = 0; i < P.rings.length; i++) {
      const m = P.rings[i];
      if (m.life > 0) {
        m.life -= delta;
        advance(m, delta);
        const t = 1 - Math.max(m.life, 0) / m.max;
        const eased = 1 - (1 - t) * (1 - t);
        dummy.position.set(m.position[0], m.position[1], m.position[2]);
        if (m.spin === 1) dummy.quaternion.copy(FLAT);
        else dummy.quaternion.copy(camera.quaternion);
        dummy.scale.setScalar(m.scale * (0.15 + 0.85 * eased));
        scratch.copy(white).lerp(smokeTo, t);
        rings.setColorAt(i, scratch.multiplyScalar(1 - t * 0.7));
      } else dummy.scale.setScalar(0);
      dummy.updateMatrix();
      rings.setMatrixAt(i, dummy.matrix);
    }

    // Smoke: drift up, swell, and fade toward the backdrop.
    for (let i = 0; i < P.smoke.length; i++) {
      const m = P.smoke[i];
      if (m.life > 0) {
        m.life -= delta;
        m.velocity[1] += SMOKE_RISE * delta * 0.5;
        m.velocity[0] *= 1 - delta;
        m.velocity[2] *= 1 - delta;
        advance(m, delta);
        const t = 1 - Math.max(m.life, 0) / m.max;
        dummy.position.set(m.position[0], m.position[1], m.position[2]);
        dummy.rotation.set(m.spin, m.spin * 0.7, 0);
        dummy.scale.setScalar(m.scale * (0.5 + 0.8 * t) * (1 - t * t * t));
        smoke.setColorAt(i, scratch.copy(smokeFrom).lerp(smokeTo, t * t));
      } else dummy.scale.setScalar(0);
      dummy.updateMatrix();
      smoke.setMatrixAt(i, dummy.matrix);
    }

    for (const mesh of [sparks, rubble, flashes, rings, smoke]) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={sparkMesh} args={[undefined, undefined, SPARK_POOL]} frustumCulled={false}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={rubbleMesh} args={[undefined, undefined, RUBBLE_POOL]} frustumCulled={false} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={rubbleColor} roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={flashMesh} args={[undefined, undefined, FLASH_POOL]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={ringMesh} args={[undefined, undefined, RING_POOL]} frustumCulled={false}>
        <ringGeometry args={[0.86, 1, 48]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={smokeMesh} args={[undefined, undefined, SMOKE_POOL]} frustumCulled={false}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshBasicMaterial transparent opacity={0.55} depthWrite={false} />
      </instancedMesh>
    </>
  );
}

function advance(m: Mote, delta: number) {
  m.position[0] += m.velocity[0] * delta;
  m.position[1] += m.velocity[1] * delta;
  m.position[2] += m.velocity[2] * delta;
}
