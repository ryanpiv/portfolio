"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useGame } from "../gameContext";

const targetPos = new THREE.Vector3();
const lookAt = new THREE.Vector3();

/** Third-person camera behind and above the ship, following a fraction of its motion. */
export function ChaseCamera() {
  const { config, shipRef } = useGame();
  const { camera: cam, ship } = config;

  useFrame(({ camera }, delta) => {
    const group = shipRef.current;
    if (!group) return;

    const dx = group.position.x * cam.follow;
    const dy = (group.position.y - ship.altitude) * cam.follow;
    targetPos.set(cam.offset[0] + dx, cam.offset[1] + ship.altitude + dy, cam.offset[2]);
    camera.position.lerp(targetPos, 1 - Math.exp(-cam.lag * delta));

    lookAt.set(dx * 0.5, ship.altitude + dy * 0.5, -cam.lookAhead);
    camera.lookAt(lookAt);
  });

  return null;
}
