"use client";

import { useRef } from "react";
import type * as THREE from "three";

import { useGame } from "../gameContext";
import { useGameFrame } from "../hooks/useGameFrame";

/** Real point lights are dear; this many flashes can be lit at once, newest first. */
const POOL = 4;
const RANGE = 70;

type Slot = { life: number; duration: number; peak: number };

/**
 * A small pool of point lights fed from `sim.flashes`: muzzle flashes and
 * explosions briefly light the towers and ground around them. Off entirely
 * when the visitor turns dynamic lights off; the requests are just dropped.
 */
export function FlashLights() {
  const { simRef, effects } = useGame();
  const lights = useRef<(THREE.PointLight | null)[]>([]);
  const slots = useRef<Slot[]>(Array.from({ length: POOL }, () => ({ life: 0, duration: 1, peak: 0 })));

  useGameFrame((_, delta) => {
    const { flashes } = simRef.current;
    if (!effects.dynamicLights) {
      flashes.length = 0;
      return;
    }
    while (flashes.length) {
      const flash = flashes.pop()!;
      // Take a free slot, else steal the dimmest.
      let index = slots.current.findIndex((slot) => slot.life <= 0);
      if (index < 0) {
        index = 0;
        for (let i = 1; i < POOL; i++) if (slots.current[i].life < slots.current[index].life) index = i;
      }
      const light = lights.current[index];
      if (!light) continue;
      light.position.set(flash.position[0], flash.position[1], flash.position[2]);
      light.color.set(flash.color);
      slots.current[index] = { life: flash.duration, duration: flash.duration, peak: flash.intensity };
    }
    for (let i = 0; i < POOL; i++) {
      const slot = slots.current[i];
      const light = lights.current[i];
      if (!light) continue;
      if (slot.life <= 0) {
        light.intensity = 0;
        continue;
      }
      slot.life -= delta;
      const t = Math.max(slot.life, 0) / slot.duration;
      light.intensity = slot.peak * t * t;
    }
  });

  if (!effects.dynamicLights) return null;
  return (
    <>
      {Array.from({ length: POOL }, (_, i) => (
        <pointLight
          key={i}
          ref={(light) => {
            lights.current[i] = light;
          }}
          intensity={0}
          distance={RANGE}
          decay={2}
        />
      ))}
    </>
  );
}
