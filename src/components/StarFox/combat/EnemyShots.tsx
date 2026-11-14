"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";

import { spheresOverlap } from "@utils/collision";
import type { Vec3 } from "@utils/fieldLayout";

import { useGame } from "../gameContext";
import { applyDamage, isRunLive } from "../game/gameStore";
import { SHOT_POOL } from "../game/sim";
import { useGameFrame } from "../hooks/useGameFrame";
import { hdrColor } from "./hdrColor";

const SHOT_RADIUS = 0.45;
/** Shots are dropped once they are this far behind the camera. */
const DESPAWN_MARGIN = 10;

const dummy = new THREE.Object3D();

/** Moves the enemies' shots, lands them on the ship, and renders the pool. Enemies spawn the shots. */
export function EnemyShots() {
  const { config, lighting, shipRef, simRef, store } = useGame();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { shipRadius, shotDamage } = config.combat;
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

        if (shot.position[2] > camera.position.z + DESPAWN_MARGIN) {
          shot.active = false;
        } else if (live && spheresOverlap(shot.position, SHOT_RADIUS, shipPos, shipRadius)) {
          shot.active = false;
          bursts.push({ position: [...shot.position], color: lighting.statusColors["in-progress"], size: 0.5 });
          applyDamage(store, shotDamage);
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
