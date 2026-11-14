"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";

import { spheresOverlap } from "@utils/collision";
import type { Vec3 } from "@utils/fieldLayout";

import { useGame } from "../gameContext";
import { SHOT_LIFE, SHOT_POOL } from "../game/sim";
import { useGameFrame } from "../hooks/useGameFrame";
import { hdrColor } from "./hdrColor";

const SHOT_RADIUS = 0.45;
/** Extra speed a deflected shot picks up on its way back. */
const DEFLECT_SPEED = 40;

const dummy = new THREE.Object3D();

/**
 * Moves the enemies' shots, lands them on the ship, and renders the pool.
 * Enemies spawn the shots (`fireShot`). A barrel roll or an immunity window
 * bounces a shot back the way it came instead of landing it.
 */
export function EnemyShots() {
  const { combat, lighting, shipRef, simRef, isLive, damageShip } = useGame();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { shipRadius, shotDamage } = combat;
  const color = useMemo(() => hdrColor(lighting.statusColors["in-progress"], lighting.glowGain), [lighting]);

  useGameFrame((_, delta) => {
    const instanced = mesh.current;
    const ship = shipRef.current;
    if (!instanced || !ship) return;
    const { shots, bursts } = simRef.current;
    const shipPos: Vec3 = [ship.position.x, ship.position.y, ship.position.z];
    const live = isLive();

    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      if (shot.active) {
        shot.age += delta;
        shot.position[0] += shot.velocity[0] * delta;
        shot.position[1] += shot.velocity[1] * delta;
        shot.position[2] += shot.velocity[2] * delta;

        if (shot.age > SHOT_LIFE) {
          shot.active = false;
        } else if (live && spheresOverlap(shot.position, SHOT_RADIUS, shipPos, shipRadius)) {
          if (ship.userData.rolling || ship.userData.immune) {
            deflect(shot.velocity, shot.position, shipPos, shipRadius + SHOT_RADIUS);
            bursts.push({ position: [...shot.position], color: lighting.statusColors.live, size: 0.3 });
          } else {
            shot.active = false;
            bursts.push({ position: [...shot.position], color: lighting.statusColors["in-progress"], size: 0.5 });
            damageShip(shotDamage);
          }
        }
      }
      if (shot.active) {
        dummy.position.set(shot.position[0], shot.position[1], shot.position[2]);
        dummy.scale.setScalar(SHOT_RADIUS);
      } else {
        dummy.scale.setScalar(0);
      }
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    }
    instanced.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, SHOT_POOL]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </instancedMesh>
  );
}

/** Reverses a shot off the ship: flips its velocity, adds pace, and parks it just outside the hull. */
function deflect(velocity: Vec3, position: Vec3, shipPos: Vec3, gap: number) {
  const speed = Math.hypot(velocity[0], velocity[1], velocity[2]) || 1;
  const boost = (speed + DEFLECT_SPEED) / speed;
  velocity[0] = -velocity[0] * boost;
  velocity[1] = -velocity[1] * boost;
  velocity[2] = -velocity[2] * boost;
  const dx = position[0] - shipPos[0];
  const dy = position[1] - shipPos[1];
  const dz = position[2] - shipPos[2];
  const d = Math.hypot(dx, dy, dz) || 1;
  position[0] = shipPos[0] + (dx / d) * gap;
  position[1] = shipPos[1] + (dy / d) * gap;
  position[2] = shipPos[2] + (dz / d) * gap;
}
