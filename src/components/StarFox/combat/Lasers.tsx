"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useGame } from "../gameContext";
import { useGameFrame } from "../hooks/useGameFrame";
import { LASER_POOL } from "../game/sim";
import { hdrColor } from "./hdrColor";

/** Muzzle points in ship-local space; bolts alternate between them. */
const MUZZLES = [new THREE.Vector3(-2.4, -0.75, -0.6), new THREE.Vector3(2.4, -0.75, -0.6)];
const BOLT_THICKNESS = 0.14;
/** Wingtip bolts drift inward to meet on the ship's centreline this far ahead. */
const CONVERGE_DISTANCE = 70;

const dummy = new THREE.Object3D();
const muzzleWorld = new THREE.Vector3();

/** Twin lasers fired straight ahead (−z) from the wingtips, rate-capped, pooled. */
export function Lasers() {
  const { config, lighting, shipRef, input, simRef } = useGame();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const cooldown = useRef(0);
  const barrel = useRef(0);
  const { fireRate, laserSpeed, laserLength, laserRange } = config.combat;
  const color = useMemo(() => hdrColor(lighting.statusColors.live, lighting.glowGain), [lighting]);

  useGameFrame((_, delta) => {
    const instanced = mesh.current;
    const ship = shipRef.current;
    if (!instanced || !ship) return;
    const { lasers } = simRef.current;

    cooldown.current -= delta;
    if (input.current.fire && cooldown.current <= 0) {
      const bolt = lasers.find((l) => !l.active);
      if (bolt) {
        ship.updateMatrixWorld();
        muzzleWorld.copy(MUZZLES[barrel.current]).applyMatrix4(ship.matrixWorld);
        bolt.active = true;
        bolt.position = [muzzleWorld.x, muzzleWorld.y, muzzleWorld.z];
        bolt.prevZ = muzzleWorld.z;
        bolt.vx = ((ship.position.x - muzzleWorld.x) * laserSpeed) / CONVERGE_DISTANCE;
        barrel.current = (barrel.current + 1) % MUZZLES.length;
        cooldown.current = 1 / fireRate;
      }
    }

    for (let i = 0; i < lasers.length; i++) {
      const bolt = lasers[i];
      if (bolt.active) {
        bolt.prevZ = bolt.position[2];
        bolt.position[0] += bolt.vx * delta;
        bolt.position[2] -= laserSpeed * delta;
        if (bolt.position[2] < -laserRange) bolt.active = false;
      }
      if (bolt.active) {
        dummy.position.set(bolt.position[0], bolt.position[1], bolt.position[2] - laserLength / 2);
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
