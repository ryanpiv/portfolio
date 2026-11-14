"use client";

import { useRef } from "react";
import * as THREE from "three";

import { weapons } from "@data/lab";
import { findClearPoint, respawnYaw } from "@utils/arenaSpawn";
import { resolveSphereAabb } from "@utils/collision";
import type { Vec3 } from "@utils/fieldLayout";
import { recordStat } from "@utils/progressStore";

import { ShipModel } from "../entities/ShipModel";
import { useBarrelRoll } from "../entities/useBarrelRoll";
import { noseToward, turnToward } from "../game/steering";
import { useGameFrame } from "../hooks/useGameFrame";
import { aliveBoxes } from "./arenaState";
import { useRoam } from "./roamContext";
import { damageHull, respawn as respawnStore, startArrival } from "./roamStore";

/** Smoothing rate for the visual bank (1/s). */
const BANK_LAMBDA = 8;
/** Yaw rate applied when the ship is pushed back inside the arena (× turnRate). */
const BOUNDARY_TURN = 1.5;
/** Spawn altitude. */
const START_ALTITUDE = 12;
/** The ship's death burst relative to a fighter's. */
const DEATH_BURST_SIZE = 3;
/** Blink rate while immune (Hz). */
const BLINK_HZ = 8;
/** How far past a portal ring an arriving ship appears. */
const ARRIVAL_OFFSET = 10;

const FORWARD = new THREE.Vector3(0, 0, -1);
const forward = new THREE.Vector3();
const euler = new THREE.Euler(0, 0, 0, "YXZ");

/**
 * All-range flight: always moving forward; lateral input yaws, vertical
 * input pitches, Shift boosts and Ctrl/X brakes. Towers hurt in proportion
 * to how head-on you hit them; at zero health the ship blows up and comes
 * back where it fell (nudged into open air) with a few seconds of immunity.
 * The yaw/pitch attitude is published on `userData.aim` for the lasers and
 * camera; the visible group adds bank and barrel roll on top.
 */
export function RoamShip() {
  const { config, combat, lighting, shipRef, inputRef, simRef, weaponRef, progress, radarRef, layout, arenaRef, store } =
    useRoam();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const speed = useRef(config.flight.cruiseSpeed);
  const bank = useRef(0);
  const aim = useRef(new THREE.Quaternion());
  /** Seconds of immunity left. */
  const immune = useRef(0);
  /** Seconds until a tower can hurt again. */
  const grace = useRef(0);
  /** Seconds until respawn while dead; null while alive. */
  const wreck = useRef<number | null>(null);
  const placed = useRef(false);
  const stepRoll = useBarrelRoll();
  const { flight, arena, hull, collision } = config;

  const bounds = { radius: arena.radius, minAltitude: arena.minAltitude, maxAltitude: arena.maxAltitude };

  useGameFrame(({ clock }, delta) => {
    const group = shipRef.current;
    if (!group) return;
    const state = store.get();

    // First frame: come out of a portal if we were sent back to one.
    if (!placed.current) {
      placed.current = true;
      const spot = layout.portals.find((p) => p.project.slug === state.spawnPortal);
      if (spot) {
        const [nx, , nz] = spot.normal;
        group.position.set(
          spot.position[0] + nx * ARRIVAL_OFFSET,
          spot.position[1],
          spot.position[2] + nz * ARRIVAL_OFFSET,
        );
        yaw.current = noseToward(spot.position, [0, 0, 0]);
        immune.current = hull.immunity;
        const { slug, title, status } = spot.project;
        startArrival(store, { slug, title, color: lighting.statusColors[status] });
      }
    }

    // Dead: linger, then come back nearby in open air.
    if (state.phase === "dead") {
      if (wreck.current === null) {
        wreck.current = hull.respawnDelay;
        group.visible = false;
        simRef.current.bursts.push({
          position: [group.position.x, group.position.y, group.position.z],
          color: lighting.statusColors.showcase,
          size: DEATH_BURST_SIZE,
        });
        recordStat(progress, "deaths");
      }
      wreck.current -= delta;
      if (wreck.current <= 0) {
        wreck.current = null;
        const boxes = aliveBoxes(arenaRef.current);
        const here: Vec3 = [group.position.x, group.position.y, group.position.z];
        const spot = findClearPoint(here, boxes, hull.respawnClearance, bounds);
        group.position.set(spot[0], spot[1], spot[2]);
        yaw.current = respawnYaw(spot, yaw.current, boxes, hull.respawnClearance);
        pitch.current = 0;
        speed.current = flight.cruiseSpeed;
        immune.current = hull.immunity;
        grace.current = 0;
        weaponRef.current = weapons.twin;
        group.visible = true;
        respawnStore(store);
      }
      return;
    }

    const live = state.transition === null;
    const { x, y, throttle } = live ? inputRef.current : { x: 0, y: 0, throttle: 1 as const };

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

    // Towers: slide along them; a hit hurts in proportion to how head-on it was.
    immune.current = Math.max(0, immune.current - delta);
    grace.current = Math.max(0, grace.current - delta);
    const center: Vec3 = [group.position.x, group.position.y, group.position.z];
    let severity = 0;
    for (const tower of arenaRef.current.towers) {
      if (!tower.alive) continue;
      const pushed = resolveSphereAabb(center, combat.shipRadius, tower.box);
      if (!pushed) continue;
      // Push-out direction is the wall normal; how much of our heading pointed into it is the severity.
      const nx = pushed[0] - center[0];
      const ny = pushed[1] - center[1];
      const nz = pushed[2] - center[2];
      const n = Math.hypot(nx, ny, nz) || 1;
      severity = Math.max(severity, -(forward.x * nx + forward.y * ny + forward.z * nz) / n);
      center[0] = pushed[0];
      center[1] = pushed[1];
      center[2] = pushed[2];
    }
    group.position.set(center[0], center[1], center[2]);
    if (severity > 0 && live && immune.current === 0 && grace.current === 0) {
      const damage =
        severity >= collision.fatalAbove
          ? Infinity
          : severity >= collision.heavyAbove
            ? collision.heavyDamage
            : collision.lightDamage;
      grace.current = collision.grace;
      simRef.current.bursts.push({ position: [...center], color: lighting.statusColors["in-progress"], size: 0.6 });
      damageHull(store, damage);
    }

    // Pose: aim first, then bank and roll about the ship's own nose.
    bank.current = THREE.MathUtils.damp(bank.current, -x * flight.bank, BANK_LAMBDA, delta);
    group.quaternion.copy(aim.current);
    group.rotateZ(bank.current + stepRoll(group, delta));
    group.userData.aim = aim.current;
    group.userData.speed = speed.current;
    group.userData.immune = immune.current > 0;
    // Blink while immune so the window is readable.
    group.visible = immune.current === 0 || Math.floor(clock.elapsedTime * BLINK_HZ) % 2 === 0;

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
