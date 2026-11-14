"use client";

import * as THREE from "three";

import { useGameFrame } from "../hooks/useGameFrame";
import { useRoam } from "./roamContext";

const IDENTITY = new THREE.Quaternion();
const offset = new THREE.Vector3();
const targetPos = new THREE.Vector3();
const lookAt = new THREE.Vector3();
const FORWARD = new THREE.Vector3(0, 0, -1);

/**
 * Chase camera that sits behind and above the ship along its aim (yaw and
 * pitch, never the roll), so the horizon stays level through a barrel roll.
 */
export function RoamCamera() {
  const { config, shipRef } = useRoam();
  const { camera: cam } = config;

  useGameFrame(({ camera }, delta) => {
    const ship = shipRef.current;
    if (!ship) return;
    const aim: THREE.Quaternion = ship.userData.aim ?? IDENTITY;

    offset.set(0, cam.height, cam.distance).applyQuaternion(aim);
    targetPos.copy(ship.position).add(offset);
    camera.position.lerp(targetPos, 1 - Math.exp(-cam.lag * delta));

    lookAt.copy(FORWARD).applyQuaternion(aim).multiplyScalar(cam.lookAhead).add(ship.position);
    camera.up.set(0, 1, 0);
    camera.lookAt(lookAt);
  });

  return null;
}
