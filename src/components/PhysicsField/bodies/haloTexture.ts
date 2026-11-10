import * as THREE from "three";

const SIZE = 128;

/** Roughly exponential falloff: bright pinpoint, long soft tail, no visible rim. */
const STOPS: Array<[offset: number, alpha: number]> = [
  [0, 1],
  [0.08, 0.7],
  [0.2, 0.3],
  [0.4, 0.1],
  [0.7, 0.025],
  [1, 0],
];

let shared: THREE.CanvasTexture | null = null;

/** Radial-gradient sprite texture, generated once and shared by every halo. */
export function getHaloTexture(): THREE.CanvasTexture {
  if (shared) return shared;

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  const half = SIZE / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  for (const [offset, alpha] of STOPS) {
    gradient.addColorStop(offset, `rgba(255,255,255,${alpha})`);
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);

  shared = new THREE.CanvasTexture(canvas);
  shared.colorSpace = THREE.SRGBColorSpace;
  return shared;
}
