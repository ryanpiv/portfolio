"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { Nameplate } from "@components/LabScene";
import { powerUps, weapons, type PowerUpSpec } from "@data/lab";
import { randomClearPoint } from "@utils/arenaSpawn";
import { spheresOverlap } from "@utils/collision";
import { createRng, type Vec3 } from "@utils/fieldLayout";
import { recordStat } from "@utils/progressStore";

import { hdrColor } from "../combat/hdrColor";
import { useGameFrame } from "../hooks/useGameFrame";
import { aliveBoxes } from "./arenaState";
import { useRoam } from "./roamContext";
import { addScore, equipWeapon, repairHull } from "./roamStore";

/** Open air needed around a pickup so it is never wedged against a tower. */
const PICKUP_CLEARANCE = 8;
const SPIN = 1.4;
const BOB = 0.6;
const PLATE_DISTANCE = 45;
/** A repair pickup restores this fraction of max health. */
const REPAIR_FRACTION = 0.5;
/** Pickup visual size. */
const SCALE = 1.4;

type Pickup = {
  id: string;
  spec: PowerUpSpec;
  position: Vec3;
};

/**
 * Weapon and repair pickups floating around the arena. Fly through one to
 * take it; it comes back somewhere else a few seconds later. Weapons last
 * until the ship is lost.
 */
export function PowerUps() {
  const { config, lighting, shipRef, simRef, weaponRef, progress, store, arenaRef, radarRef } = useRoam();
  const { pickups: tuning, arena, hull, scoring } = config;
  const rng = useMemo(() => createRng(arena.seed * 104729), [arena.seed]);
  const bounds = useMemo(
    () => ({ radius: arena.radius * 0.85, minAltitude: tuning.minAltitude, maxAltitude: tuning.maxAltitude }),
    [arena.radius, tuning.minAltitude, tuning.maxAltitude],
  );

  const place = useCallback(
    (index: number): Pickup => {
      // Repair is common; the weapons rotate through the remaining slots.
      const spec = index % 2 === 0 ? powerUps[0] : powerUps[1 + (Math.floor(index / 2) % (powerUps.length - 1))];
      const position = randomClearPoint(rng, aliveBoxes(arenaRef.current), PICKUP_CLEARANCE, bounds);
      return { id: `pickup-${index}-${Math.floor(rng() * 1e9)}`, spec, position };
    },
    [rng, arenaRef, bounds],
  );

  // Placed on the first frame: placement reads the tower state, which lives in a ref.
  const [pickups, setPickups] = useState<Pickup[]>([]);
  /** Slot index → seconds until it refills. */
  const pending = useRef(new Map<number, number>());
  const groups = useRef(new Map<string, THREE.Group>());

  const register = useCallback((id: string, group: THREE.Group | null) => {
    if (group) groups.current.set(id, group);
    else groups.current.delete(id);
  }, []);

  useGameFrame(({ clock }, delta) => {
    const ship = shipRef.current;
    if (!ship) return;
    if (pickups.length === 0) {
      setPickups(Array.from({ length: tuning.count }, (_, i) => place(i)));
      return;
    }
    const shipPos: Vec3 = [ship.position.x, ship.position.y, ship.position.z];
    const t = clock.elapsedTime;
    const blips = radarRef.current.pickups;
    blips.length = 0;
    const taken: string[] = [];

    pickups.forEach((pickup, slot) => {
      const group = groups.current.get(pickup.id);
      // Collected pickups are parked underground until their slot refills.
      if (!group || pickup.position[1] < 0) return;
      group.rotation.y = t * SPIN;
      group.position.set(pickup.position[0], pickup.position[1] + Math.sin(t * 1.5 + slot) * BOB, pickup.position[2]);
      const color = lighting.statusColors[pickup.spec.color];
      blips.push({ x: pickup.position[0], z: pickup.position[2], color });

      if (!spheresOverlap(pickup.position, tuning.radius, shipPos, 1)) return;
      taken.push(pickup.id);
      pending.current.set(slot, tuning.respawnDelay);
      simRef.current.bursts.push({ position: [...pickup.position], color, size: 0.8 });
      addScore(store, scoring.pickup);
      recordStat(progress, "points", scoring.pickup);
      if (pickup.spec.kind === "weapon" && pickup.spec.weapon) {
        weaponRef.current = weapons[pickup.spec.weapon];
        equipWeapon(store, pickup.spec.weapon);
      } else {
        repairHull(store, hull.healthMax * REPAIR_FRACTION);
      }
    });

    const refills: number[] = [];
    pending.current.forEach((left, slot) => {
      const next = left - delta;
      if (next <= 0) {
        pending.current.delete(slot);
        refills.push(slot);
      } else {
        pending.current.set(slot, next);
      }
    });

    if (taken.length || refills.length) {
      setPickups((list) =>
        list.map((p, slot) => {
          if (refills.includes(slot)) return place(slot);
          if (taken.includes(p.id)) return { ...p, position: [0, -1000, 0] as Vec3 };
          return p;
        }),
      );
    }
  });

  return (
    <>
      {pickups.map((pickup) => (
        <PickupModel key={pickup.id} pickup={pickup} register={register} />
      ))}
    </>
  );
}

type PickupModelProps = {
  pickup: Pickup;
  register: (id: string, group: THREE.Group | null) => void;
};

/** A spinning ring with a glowing core, labelled with what it gives you. */
function PickupModel({ pickup, register }: PickupModelProps) {
  const { lighting } = useRoam();
  const color = lighting.statusColors[pickup.spec.color];
  const glow = useMemo(() => hdrColor(color, lighting.glowGain), [color, lighting.glowGain]);
  const ring = pickup.spec.kind === "repair";

  return (
    <group
      position={pickup.position}
      scale={SCALE}
      ref={(group) => {
        register(pickup.id, group);
        return () => register(pickup.id, null);
      }}
    >
      <mesh>
        {ring ? <torusGeometry args={[0.9, 0.18, 10, 24]} /> : <octahedronGeometry args={[1, 0]} />}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.32, 12, 10]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
      <Nameplate label={pickup.spec.title} radius={1} color={color} distanceFactor={PLATE_DISTANCE} />
    </group>
  );
}
