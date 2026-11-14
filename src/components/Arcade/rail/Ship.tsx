"use client";

import { useRef } from "react";
import * as THREE from "three";

import { ShipModel } from "../entities/ShipModel";
import { useBarrelRoll } from "../entities/useBarrelRoll";
import { useGameFrame } from "../hooks/useGameFrame";
import { useRail } from "./railContext";

/** Smoothing rate for roll/pitch (1/s). */
const ATTITUDE_LAMBDA = 10;
/** The ship's death burst relative to a fighter's. */
const DEATH_BURST_SIZE = 3;

const targetVel = new THREE.Vector2();

/** The player: steers inside a box in the view plane, banks into turns, and blows up when the shield is gone. */
export function Ship() {
  const { config, lighting, shipRef, inputRef, simRef, store } = useRail();
  const velocity = useRef(new THREE.Vector2());
  const bank = useRef(0);
  const stepRoll = useBarrelRoll();
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

    const { x, y } = inputRef.current;
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
    bank.current = THREE.MathUtils.damp(bank.current, -nx * ship.bank, ATTITUDE_LAMBDA, delta);
    group.rotation.z = bank.current + stepRoll(group, delta);
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
