"use client";

import { useEffect, useRef } from "react";

import type { RadarFrame, RadarRef } from "./radarFrame";
import styles from "./Radar.module.scss";

export const RADAR_SIZE = 112;
const BLIP_RADIUS = 2.5;
const SHIP_SIZE = 5;
const RING_COUNT = 2;

type RadarProps = {
  radarRef: RadarRef;
  /** CSS colors for the chrome; blips carry their own. */
  ink: string;
  muted: string;
};

/**
 * Top-down minimap: portals and roamers relative to the ship, ship-up.
 * Draws from the shared radar ref on its own animation frame, so React
 * never re-renders for it.
 */
export function Radar({ radarRef, ink, muted }: RadarProps) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext("2d");
    if (!element || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    element.width = RADAR_SIZE * dpr;
    element.height = RADAR_SIZE * dpr;
    ctx.scale(dpr, dpr);

    let frame = 0;
    const draw = () => {
      paint(ctx, radarRef.current, ink, muted);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [radarRef, ink, muted]);

  return (
    <canvas
      ref={canvas}
      className={styles.radar}
      style={{ width: RADAR_SIZE, height: RADAR_SIZE }}
      role="img"
      aria-label="Radar: portals and fighters around the ship"
    />
  );
}

function paint(ctx: CanvasRenderingContext2D, radar: RadarFrame, ink: string, muted: string) {
  const half = RADAR_SIZE / 2;
  const scale = half / radar.range;
  ctx.clearRect(0, 0, RADAR_SIZE, RADAR_SIZE);

  // Rings
  ctx.strokeStyle = muted;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1;
  for (let i = 1; i <= RING_COUNT; i++) {
    ctx.beginPath();
    ctx.arc(half, half, (half - 1) * (i / RING_COUNT), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Rotate so the ship's heading points up. World −z is "forward" at yaw 0.
  ctx.save();
  ctx.translate(half, half);
  ctx.rotate(radar.ship.yaw);
  const plot = (x: number, z: number): [number, number] => [(x - radar.ship.x) * scale, (z - radar.ship.z) * scale];

  for (const blip of radar.portals) {
    const [px, pz] = plot(blip.x, blip.z);
    ctx.fillStyle = blip.color;
    ctx.beginPath();
    ctx.arc(px, pz, BLIP_RADIUS + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const blip of radar.pickups) {
    const [px, pz] = plot(blip.x, blip.z);
    ctx.fillStyle = blip.color;
    ctx.fillRect(px - BLIP_RADIUS * 0.7, pz - BLIP_RADIUS * 0.7, BLIP_RADIUS * 1.4, BLIP_RADIUS * 1.4);
  }
  for (const blip of radar.roamers) {
    const [px, pz] = plot(blip.x, blip.z);
    ctx.strokeStyle = blip.color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(px, pz, BLIP_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Ship: a chevron at the center, always pointing up.
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(half, half - SHIP_SIZE);
  ctx.lineTo(half + SHIP_SIZE * 0.7, half + SHIP_SIZE * 0.7);
  ctx.lineTo(half, half + SHIP_SIZE * 0.3);
  ctx.lineTo(half - SHIP_SIZE * 0.7, half + SHIP_SIZE * 0.7);
  ctx.closePath();
  ctx.fill();
}
