"use client";

import { useRef } from "react";
import type * as THREE from "three";

import { useGameFrame } from "../hooks/useGameFrame";
import { useRoam } from "./roamContext";

/** The light rides this far ahead of and below the ship so it sweeps the street rather than the hull. */
const LEAD = 6;
const DROP = 1.5;

const forward = { x: 0, y: 0, z: -1 };

/** A headlight that follows the ship and throws its own light on the towers it passes. */
export function ShipLight() {
  const { shipRef, effects, config } = useRoam();
  const light = useRef<THREE.PointLight>(null);
  const scratch = useRef<THREE.Vector3 | null>(null);

  useGameFrame(() => {
    const ship = shipRef.current;
    const lamp = light.current;
    if (!ship || !lamp) return;
    scratch.current ??= lamp.position.clone();
    const v = scratch.current;
    v.set(forward.x, forward.y, forward.z).applyQuaternion(ship.quaternion).multiplyScalar(LEAD);
    lamp.position.copy(ship.position).add(v);
    lamp.position.y -= DROP;
  });

  if (!effects.dynamicLights) return null;
  const { color, intensity, distance } = config.world.headlight;
  return <pointLight ref={light} color={color} intensity={intensity} distance={distance} decay={2} />;
}
