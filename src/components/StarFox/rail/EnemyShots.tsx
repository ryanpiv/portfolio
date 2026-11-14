"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";

import { spheresOverlap } from "@utils/collision";
import type { Vec3 } from "@utils/fieldLayout";

import { useRail } from "./railContext";
import { applyDamage, isRunLive } from "./gameStore";
import { SHOT_POOL } from "../game/sim";
import { useGameFrame } from "../hooks/useGameFrame";
import { hdrColor } from "../combat/hdrColor";

const SHOT_RADIUS = 0.45;
/** Shots are dropped once they are this far behind the camera. */
const DESPAWN_MARGIN = 10;
/** Extra forward speed a deflected shot picks up. */
const DEFLECT_SPEED = 40;

const dummy = new THREE.Object3D();

/** Moves the enemies' shots, lands them on the ship, and renders the pool. Enemies spawn the shots. */
export function EnemyShots() {
  const { combat, lighting, shipRef, simRef, store } = useRail();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { shipRadius, shotDamage } = combat;
  const color = useMemo(() => hdrColor(lighting.statusColors["in-progress"], lighting.glowGain), [lighting]);

  useGameFrame(({ camera }, delta) => {
    const instanced = mesh.current;
    const ship = shipRef.current;
    if (!instanced || !ship) return;
    const { shots, bursts } = simRef.current;
    const shipPos: Vec3 = [ship.position.x, ship.position.y, ship.position.z];
    const live = isRunLive(store.get().phase);

    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      if (shot.active) {
        shot.position[0] += shot.velocity[0] * delta;
        shot.position[1] += shot.velocity[1] * delta;
        shot.position[2] += shot.velocity[2] * delta;

        if (shot.position[2] > camera.position.z + DESPAWN_MARGIN || shot.position[2] < -combat.laserRange) {
          shot.active = false;
        } else if (live && spheresOverlap(shot.position, SHOT_RADIUS, shipPos, shipRadius)) {
          if (ship.userData.rolling) {
            // A barrel roll deflects the shot back the way it came.
            shot.velocity = [shot.velocity[0], shot.velocity[1], -Math.abs(shot.velocity[2]) - DEFLECT_SPEED];
            shot.position[2] = shipPos[2] - shipRadius - SHOT_RADIUS;
            bursts.push({ position: [...shot.position], color: lighting.statusColors.live, size: 0.3 });
          } else {
            shot.active = false;
            bursts.push({ position: [...shot.position], color: lighting.statusColors["in-progress"], size: 0.5 });
            applyDamage(store, shotDamage);
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
