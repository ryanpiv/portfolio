"use client";

import { useRef } from "react";
import * as THREE from "three";

import { useGame } from "../gameContext";
import { useGameFrame } from "../hooks/useGameFrame";
import { ShipModel } from "./ShipModel";

/** Smoothing rate for roll/pitch (1/s). */
const ATTITUDE_LAMBDA = 10;
/** The ship's death burst relative to a fighter's. */
const DEATH_BURST_SIZE = 3;

const targetVel = new THREE.Vector2();

/** The player: steers inside a box in the view plane, banks into turns, and blows up when the shield is gone. */
export function Ship() {
  const { config, lighting, shipRef, input, simRef, store } = useGame();
  const velocity = useRef(new THREE.Vector2());
  const { ship } = config;

  useGameFrame((_, delta) => {
    const group = shipRef.current;
    if (!group) return;

    if (store.get().phase === "failed") {
      if (group.visible) {
        group.visible = false;
        simRef.current.bursts.push({
          position: [group.position.x, group.position.y, group.position.z],
          color: lighting.statusColors.showcase,
          size: DEATH_BURST_SIZE,
        });
      }
      return;
    }

    const { x, y } = input.current;
    targetVel.set(x, y).multiplyScalar(ship.speed);
    velocity.current.lerp(targetVel, 1 - Math.exp(-ship.responsiveness * delta));

    const minY = ship.altitude - ship.halfHeight;
    const maxY = ship.altitude + ship.halfHeight;
    const nextX = group.position.x + velocity.current.x * delta;
    const nextY = group.position.y + velocity.current.y * delta;
    group.position.x = THREE.MathUtils.clamp(nextX, -ship.halfWidth, ship.halfWidth);
    group.position.y = THREE.MathUtils.clamp(nextY, minY, maxY);
    // Kill velocity into a wall so the ship doesn't stay banked against it.
    if (group.position.x !== nextX) velocity.current.x = 0;
    if (group.position.y !== nextY) velocity.current.y = 0;

    const nx = velocity.current.x / ship.speed;
    const ny = velocity.current.y / ship.speed;
    group.rotation.z = THREE.MathUtils.damp(group.rotation.z, -nx * ship.bank, ATTITUDE_LAMBDA, delta);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, ny * ship.pitch, ATTITUDE_LAMBDA, delta);
  });

  return (
    <group ref={shipRef} position={[0, ship.altitude, 0]}>
      <ShipModel
        color={lighting.core.color}
        accent={lighting.statusColors.live}
        glow={lighting.statusColors.showcase}
      />
    </group>
  );
}
