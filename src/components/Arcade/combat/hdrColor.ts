import * as THREE from "three";

/** Scales a status color by the preset's glow gain; pair with `toneMapped={false}` so bloom picks it up. */
export function hdrColor(hex: string, gain: number): THREE.Color {
  return new THREE.Color(hex).multiplyScalar(gain);
}
