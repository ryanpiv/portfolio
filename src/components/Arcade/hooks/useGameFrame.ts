"use client";

import { useFrame, type RootState } from "@react-three/fiber";

/**
 * Longest step the simulation will take in one frame. After a stall (tab
 * hidden, shader compile) the clock hands over seconds at once; stepping by
 * that would teleport everything, so we drop the excess time instead.
 */
const MAX_FRAME_DELTA = 0.1;

export type GameFrameCallback = (state: RootState, delta: number) => void;

/** `useFrame` with the delta clamped to `MAX_FRAME_DELTA`. All game systems use this. */
export function useGameFrame(callback: GameFrameCallback) {
  useFrame((state, delta) => callback(state, Math.min(delta, MAX_FRAME_DELTA)));
}
