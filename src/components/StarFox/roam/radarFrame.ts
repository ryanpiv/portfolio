import type { RefObject } from "react";

/**
 * Top-down radar snapshot. The scene writes it every frame; the DOM radar
 * reads it on its own animation frame. A ref, not a store, so no React
 * work happens per frame.
 */

export type RadarBlip = { x: number; z: number; color: string };

export type RadarFrame = {
  /** World radius the radar covers. */
  range: number;
  ship: { x: number; z: number; yaw: number };
  portals: RadarBlip[];
  roamers: RadarBlip[];
  pickups: RadarBlip[];
};

export type RadarRef = RefObject<RadarFrame>;

export function createRadarFrame(range: number): RadarFrame {
  return { range, ship: { x: 0, z: 0, yaw: 0 }, portals: [], roamers: [], pickups: [] };
}
