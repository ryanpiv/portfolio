"use client";

import { useRef } from "react";
import * as THREE from "three";

import { resolveSphereAabb } from "@utils/collision";
import type { Vec3 } from "@utils/fieldLayout";

import { ShipModel } from "../entities/ShipModel";
import { noseToward, turnToward } from "../game/steering";
import { useBarrelRoll } from "../entities/useBarrelRoll";
import { useGameFrame } from "../hooks/useGameFrame";
import { useRoam } from "./roamContext";

/** Smoothing rate for the visual bank (1/s). */
const BANK_LAMBDA = 8;
/** Yaw rate applied when the ship is pushed back inside the arena (× turnRate). */
const BOUNDARY_TURN = 1.5;
/** Spawn altitude. */
const START_ALTITUDE = 12;

const FORWARD = new THREE.Vector3(0, 0, -1);
const forward = new THREE.Vector3();
const euler = new THREE.Euler(0, 0, 0, "YXZ");

/**
 * All-range flight: always moving forward; lateral input yaws, vertical
 * input pitches, Shift boosts and Ctrl/X brakes. The yaw/pitch attitude is
 * published on `userData.aim` for the lasers and camera; the visible group
 * adds bank and barrel roll on top.
 */
export function RoamShip() {
  const { config, combat, lighting, shipRef, inputRef, radarRef, layout, isLive } = useRoam();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const speed = useRef(config.flight.cruiseSpeed);
  const bank = useRef(0);
  const aim = useRef(new THREE.Quaternion());
  const stepRoll = useBarrelRoll();
  const { flight, arena } = config;

  useGameFrame((_, delta) => {
    const group = shipRef.current;
    if (!group) return;
    const { x, y, throttle } = isLive() ? inputRef.current : { x: 0, y: 0, throttle: 1 as const };

    // Attitude
    yaw.current -= x * flight.turnRate * delta;
    pitch.current = THREE.MathUtils.damp(pitch.current, y * flight.maxPitch, flight.pitchResponse, delta);

    // Speed
    const target = throttle > 0 ? flight.boostSpeed : throttle < 0 ? flight.brakeSpeed : flight.cruiseSpeed;
    speed.current = THREE.MathUtils.damp(speed.current, target, flight.acceleration, delta);

    // Move
    euler.set(pitch.current, yaw.current, 0);
    aim.current.setFromEuler(euler);
    forward.copy(FORWARD).applyQuaternion(aim.current);
    group.position.addScaledVector(forward, speed.current * delta);

    // Altitude band: level off against the floor and ceiling.
    if (group.position.y < arena.minAltitude) {
      group.position.y = arena.minAltitude;
      pitch.current = Math.max(0, pitch.current);
    } else if (group.position.y > arena.maxAltitude) {
      group.position.y = arena.maxAltitude;
      pitch.current = Math.min(0, pitch.current);
    }

    // Arena edge: hold the radius and turn back toward the center.
    const r = Math.hypot(group.position.x, group.position.z);
    if (r > arena.radius) {
      group.position.x *= arena.radius / r;
      group.position.z *= arena.radius / r;
      const toCenter = noseToward([group.position.x, 0, group.position.z], [0, 0, 0]);
      yaw.current = turnToward(yaw.current, toCenter, flight.turnRate * BOUNDARY_TURN * delta);
    }

    // Towers: slide along them, no damage (the arena is a sandbox).
    const center: Vec3 = [group.position.x, group.position.y, group.position.z];
    for (const building of layout.buildings) {
      const pushed = resolveSphereAabb(center, combat.shipRadius, building.box);
      if (pushed) {
        center[0] = pushed[0];
        center[1] = pushed[1];
        center[2] = pushed[2];
      }
    }
    group.position.set(center[0], center[1], center[2]);

    // Pose: aim first, then bank and roll about the ship's own nose.
    bank.current = THREE.MathUtils.damp(bank.current, -x * flight.bank, BANK_LAMBDA, delta);
    group.quaternion.copy(aim.current);
    group.rotateZ(bank.current + stepRoll(group, delta));
    group.userData.aim = aim.current;
    group.userData.speed = speed.current;

    radarRef.current.ship = { x: group.position.x, z: group.position.z, yaw: yaw.current };
  });

  return (
    <group ref={shipRef} position={[0, START_ALTITUDE, 0]}>
      <ShipModel
        color={lighting.core.color}
        accent={lighting.statusColors.live}
        glow={lighting.statusColors.showcase}
      />
    </group>
  );
}
