"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";

import { weapons, type LightingPreset, type WeaponId, type WeaponSpec } from "@data/lab";
import { recordStat } from "@utils/progressStore";

import { useGame } from "../gameContext";
import { LASER_POOL, type Laser } from "../game/sim";
import { useGameFrame } from "../hooks/useGameFrame";
import { hdrColor } from "./hdrColor";

/** Muzzle points in ship-local space; bolts alternate between them. */
const MUZZLES = [new THREE.Vector3(-2.4, -0.75, -0.6), new THREE.Vector3(2.4, -0.75, -0.6)];
const BOLT_THICKNESS = 0.14;
/** The soft glow around a bolt, relative to its core; drawn additively. */
const GLOW_THICKNESS = 3.6;
const GLOW_LENGTH = 1.3;
const GLOW_OPACITY = 0.32;
/** Muzzle flash: a tiny burst at the gun plus a very brief real light. */
const MUZZLE_BURST_SIZE = 0.25;
const MUZZLE_LIGHT = 70;
const MUZZLE_LIGHT_SECONDS = 0.07;
/** Wingtip bolts drift inward to meet on the ship's centreline this far ahead. */
const CONVERGE_DISTANCE = 70;
const FORWARD = new THREE.Vector3(0, 0, -1);
const UP = new THREE.Vector3(0, 1, 0);
const IDENTITY = new THREE.Quaternion();

const dummy = new THREE.Object3D();
const GLOW_SCALE = new THREE.Vector3(GLOW_THICKNESS, GLOW_THICKNESS, GLOW_LENGTH);
const muzzleWorld = new THREE.Vector3();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const fan = new THREE.Quaternion();

/**
 * The player's guns: pooled bolts fired from the wingtips along the ship's
 * aim, shaped by the current weapon (rate, speed, damage, spread, size,
 * color). The aim comes from `ship.userData.aim` (yaw/pitch only) so a
 * barrel roll never sprays the shots.
 */
export function Lasers() {
  const { combat, lighting, effects, shipRef, inputRef, simRef, weaponRef, progress, isLive } = useGame();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const glow = useRef<THREE.InstancedMesh>(null);
  const cooldown = useRef(0);
  const barrel = useRef(0);
  const { fireRate, laserSpeed, laserLength, laserRange } = combat;
  const colors = useMemo(() => weaponColors(lighting), [lighting]);

  useGameFrame((_, delta) => {
    const instanced = mesh.current;
    const ship = shipRef.current;
    if (!instanced || !ship) return;
    const { lasers, bursts, flashes } = simRef.current;
    const weapon = weaponRef.current;
    const halo = glow.current;

    cooldown.current -= delta;
    if (inputRef.current.fire && cooldown.current <= 0 && isLive()) {
      const muzzle = MUZZLES[barrel.current];
      const aim: THREE.Quaternion = ship.userData.aim ?? IDENTITY;
      ship.updateMatrixWorld();
      muzzleWorld.copy(muzzle).applyMatrix4(ship.matrixWorld);
      const speed = laserSpeed * weapon.speedScale;

      let fired = 0;
      for (let b = 0; b < weapon.bolts; b++) {
        const bolt = lasers.find((l) => !l.active);
        if (!bolt) break;
        // Forward plus a lateral drift toward the centreline, fanned for spread weapons, in aim space.
        const angle = weapon.bolts > 1 ? (b / (weapon.bolts - 1) - 0.5) * weapon.spreadAngle : 0;
        fan.setFromAxisAngle(UP, angle);
        velocity.set((-muzzle.x * speed) / CONVERGE_DISTANCE, 0, -speed).applyQuaternion(fan).applyQuaternion(aim);
        arm(bolt, weapon, muzzleWorld, velocity);
        fired++;
      }
      if (fired > 0) {
        barrel.current = (barrel.current + 1) % MUZZLES.length;
        cooldown.current = 1 / (fireRate * weapon.fireRateScale);
        recordStat(progress, "shotsFired");
        const at: [number, number, number] = [muzzleWorld.x, muzzleWorld.y, muzzleWorld.z];
        const color = lighting.statusColors[weapon.color];
        bursts.push({ position: at, color, size: MUZZLE_BURST_SIZE * weapon.size });
        flashes.push({ position: at, color, intensity: MUZZLE_LIGHT * weapon.size, duration: MUZZLE_LIGHT_SECONDS });
      }
    }

    for (let i = 0; i < lasers.length; i++) {
      const bolt = lasers[i];
      if (bolt.active) {
        bolt.prev = [...bolt.position];
        bolt.position[0] += bolt.velocity[0] * delta;
        bolt.position[1] += bolt.velocity[1] * delta;
        bolt.position[2] += bolt.velocity[2] * delta;
        bolt.travelled += Math.hypot(bolt.velocity[0], bolt.velocity[1], bolt.velocity[2]) * delta;
        if (bolt.travelled > laserRange) bolt.active = false;
      }
      if (bolt.active) {
        direction.set(bolt.velocity[0], bolt.velocity[1], bolt.velocity[2]).normalize();
        dummy.position.set(bolt.position[0], bolt.position[1], bolt.position[2]).addScaledVector(direction, -laserLength / 2);
        dummy.quaternion.setFromUnitVectors(FORWARD, direction);
        dummy.scale.set(bolt.size, bolt.size, laserLength);
        instanced.setColorAt(i, colors[bolt.weapon]);
        if (halo) halo.setColorAt(i, colors[bolt.weapon]);
      } else {
        dummy.scale.setScalar(0);
      }
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
      if (halo) {
        dummy.scale.multiply(GLOW_SCALE);
        dummy.updateMatrix();
        halo.setMatrixAt(i, dummy.matrix);
      }
    }
    instanced.instanceMatrix.needsUpdate = true;
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
    if (halo) {
      halo.instanceMatrix.needsUpdate = true;
      if (halo.instanceColor) halo.instanceColor.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[undefined, undefined, LASER_POOL]} frustumCulled={false}>
        <boxGeometry args={[BOLT_THICKNESS, BOLT_THICKNESS, 1]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>
      {effects.trails && (
        <instancedMesh ref={glow} args={[undefined, undefined, LASER_POOL]} frustumCulled={false}>
          <capsuleGeometry args={[BOLT_THICKNESS, 1, 2, 8]} />
          <meshBasicMaterial
            color="#ffffff"
            toneMapped={false}
            transparent
            opacity={GLOW_OPACITY}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </instancedMesh>
      )}
    </>
  );
}

/** Puts a pooled bolt in flight. */
function arm(bolt: Laser, weapon: WeaponSpec, from: THREE.Vector3, vel: THREE.Vector3) {
  bolt.active = true;
  bolt.position = [from.x, from.y, from.z];
  bolt.prev = [...bolt.position];
  bolt.velocity = [vel.x, vel.y, vel.z];
  bolt.travelled = 0;
  bolt.damage = weapon.damage;
  bolt.heavy = weapon.heavy;
  bolt.size = weapon.size;
  bolt.weapon = weapon.id;
}

/** HDR color per weapon, from its status color and the preset's glow gain. */
function weaponColors(lighting: LightingPreset): Record<WeaponId, THREE.Color> {
  const out = {} as Record<WeaponId, THREE.Color>;
  for (const spec of Object.values(weapons)) {
    out[spec.id] = hdrColor(lighting.statusColors[spec.color], lighting.glowGain);
  }
  return out;
}
