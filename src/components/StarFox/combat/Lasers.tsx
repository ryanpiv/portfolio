"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";

import { recordStat } from "@utils/progressStore";

import { useGame } from "../gameContext";
import { LASER_POOL } from "../game/sim";
import { useGameFrame } from "../hooks/useGameFrame";
import { hdrColor } from "./hdrColor";

/** Muzzle points in ship-local space; bolts alternate between them. */
const MUZZLES = [new THREE.Vector3(-2.4, -0.75, -0.6), new THREE.Vector3(2.4, -0.75, -0.6)];
const BOLT_THICKNESS = 0.14;
/** Wingtip bolts drift inward to meet on the ship's centreline this far ahead. */
const CONVERGE_DISTANCE = 70;
const FORWARD = new THREE.Vector3(0, 0, -1);
const IDENTITY = new THREE.Quaternion();

const dummy = new THREE.Object3D();
const muzzleWorld = new THREE.Vector3();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

/**
 * Twin lasers fired from the wingtips along the ship's aim, rate-capped,
 * pooled. The aim comes from `ship.userData.aim` (yaw/pitch only) so a
 * barrel roll never sprays the shots.
 */
export function Lasers() {
  const { combat, lighting, shipRef, inputRef, simRef, progress, isLive } = useGame();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const cooldown = useRef(0);
  const barrel = useRef(0);
  const { fireRate, laserSpeed, laserLength, laserRange } = combat;
  const color = useMemo(() => hdrColor(lighting.statusColors.live, lighting.glowGain), [lighting]);

  useGameFrame((_, delta) => {
    const instanced = mesh.current;
    const ship = shipRef.current;
    if (!instanced || !ship) return;
    const { lasers } = simRef.current;

    cooldown.current -= delta;
    if (inputRef.current.fire && cooldown.current <= 0 && isLive()) {
      const bolt = lasers.find((l) => !l.active);
      if (bolt) {
        const muzzle = MUZZLES[barrel.current];
        const aim: THREE.Quaternion = ship.userData.aim ?? IDENTITY;
        ship.updateMatrixWorld();
        muzzleWorld.copy(muzzle).applyMatrix4(ship.matrixWorld);
        // Forward plus a lateral drift toward the centreline, in aim space.
        velocity.set((-muzzle.x * laserSpeed) / CONVERGE_DISTANCE, 0, -laserSpeed).applyQuaternion(aim);

        bolt.active = true;
        bolt.position = [muzzleWorld.x, muzzleWorld.y, muzzleWorld.z];
        bolt.prev = [...bolt.position];
        bolt.velocity = [velocity.x, velocity.y, velocity.z];
        bolt.travelled = 0;
        barrel.current = (barrel.current + 1) % MUZZLES.length;
        cooldown.current = 1 / fireRate;
        recordStat(progress, "shotsFired");
      }
    }

    for (let i = 0; i < lasers.length; i++) {
      const bolt = lasers[i];
      if (bolt.active) {
        bolt.prev = [...bolt.position];
        bolt.position[0] += bolt.velocity[0] * delta;
        bolt.position[1] += bolt.velocity[1] * delta;
        bolt.position[2] += bolt.velocity[2] * delta;
        bolt.travelled += laserSpeed * delta;
        if (bolt.travelled > laserRange) bolt.active = false;
      }
      if (bolt.active) {
        direction.set(bolt.velocity[0], bolt.velocity[1], bolt.velocity[2]).normalize();
        dummy.position.set(bolt.position[0], bolt.position[1], bolt.position[2]).addScaledVector(direction, -laserLength / 2);
        dummy.quaternion.setFromUnitVectors(FORWARD, direction);
        dummy.scale.set(1, 1, laserLength);
      } else {
        dummy.scale.setScalar(0);
      }
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    }
    instanced.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, LASER_POOL]} frustumCulled={false}>
      <boxGeometry args={[BOLT_THICKNESS, BOLT_THICKNESS, 1]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </instancedMesh>
  );
}
