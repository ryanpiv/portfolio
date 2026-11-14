"use client";

import { useRef } from "react";
import type * as THREE from "three";

import { recordStat } from "@utils/progressStore";

import { useGame } from "../gameContext";
import { rollAngle, startRoll, stepRoll, type Roll } from "../game/barrelRoll";

/**
 * Consumes barrel-roll requests from the input and times the spin. Returns
 * a per-frame step: call it inside `useGameFrame` and add the result to the
 * ship's bank. Marks `group.userData.rolling` so shots can be deflected.
 */
export function useBarrelRoll() {
  const { inputRef, progress } = useGame();
  const rollRef = useRef<Roll | null>(null);

  return (group: THREE.Group, delta: number): number => {
    const request = inputRef.current.roll;
    if (request !== 0) {
      inputRef.current.roll = 0;
      if (!rollRef.current) {
        rollRef.current = startRoll(request);
        recordStat(progress, "barrelRolls");
      }
    }
    rollRef.current = stepRoll(rollRef.current, delta);
    group.userData.rolling = rollRef.current !== null;
    return rollAngle(rollRef.current);
  };
}
