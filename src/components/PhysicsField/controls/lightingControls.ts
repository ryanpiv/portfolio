import { folder } from "leva";

import type { LightingPreset } from "@data/lab";

import { slider } from "./schema";

/** Leva schema seeded from a lighting preset. */
export function lightingSchema(preset: LightingPreset) {
  return {
    keyIntensity: slider(preset.key.intensity, 0, 15, 0.1),
    rimIntensity: slider(preset.rim.intensity, 0, 15, 0.1),
    emissive: slider(preset.sphere.emissiveIntensity, 0, 3, 0.01),
    hoverBoost: slider(preset.sphere.hoverEmissiveBoost, 0, 4, 0.05),
    roughness: slider(preset.sphere.roughness, 0, 1, 0.01),
    metalness: slider(preset.sphere.metalness, 0, 1, 0.01),
    stars: preset.stars,
    Halo: folder({
      haloScale: slider(preset.halo.scale, 1, 12, 0.1),
      haloOpacity: slider(preset.halo.opacity, 0, 1, 0.01),
      twinkle: slider(preset.halo.twinkle, 0, 1, 0.01),
      twinkleSpeed: slider(preset.halo.twinkleSpeed, 0, 6, 0.1),
    }),
    Bloom: folder({
      bloomIntensity: slider(preset.bloom.intensity, 0, 4, 0.05),
      bloomThreshold: slider(preset.bloom.luminanceThreshold, 0, 1, 0.01),
      bloomRadius: slider(preset.bloom.radius, 0, 1, 0.01),
    }),
    Flare: folder({
      flare: preset.flare.enabled,
      glareSize: slider(preset.flare.glareSize, 0, 1, 0.01),
      flareHaloScale: slider(preset.flare.haloScale, 0, 2, 0.01),
      ghostScale: slider(preset.flare.ghostScale, 0, 2, 0.01),
      starBurst: preset.flare.starBurst,
    }),
  };
}

type LightingValues = {
  keyIntensity: number;
  rimIntensity: number;
  emissive: number;
  hoverBoost: number;
  roughness: number;
  metalness: number;
  stars: boolean;
  haloScale: number;
  haloOpacity: number;
  twinkle: number;
  twinkleSpeed: number;
  bloomIntensity: number;
  bloomThreshold: number;
  bloomRadius: number;
  flare: boolean;
  glareSize: number;
  flareHaloScale: number;
  ghostScale: number;
  starBurst: boolean;
};

/** Overlay Leva values onto the preset. */
export function applyLighting(preset: LightingPreset, v: LightingValues): LightingPreset {
  return {
    ...preset,
    key: { ...preset.key, intensity: v.keyIntensity },
    rim: { ...preset.rim, intensity: v.rimIntensity },
    sphere: {
      ...preset.sphere,
      emissiveIntensity: v.emissive,
      hoverEmissiveBoost: v.hoverBoost,
      roughness: v.roughness,
      metalness: v.metalness,
    },
    stars: v.stars,
    halo: {
      ...preset.halo,
      scale: v.haloScale,
      opacity: v.haloOpacity,
      twinkle: v.twinkle,
      twinkleSpeed: v.twinkleSpeed,
    },
    bloom: {
      ...preset.bloom,
      intensity: v.bloomIntensity,
      luminanceThreshold: v.bloomThreshold,
      radius: v.bloomRadius,
    },
    flare: {
      ...preset.flare,
      enabled: v.flare,
      glareSize: v.glareSize,
      haloScale: v.flareHaloScale,
      ghostScale: v.ghostScale,
      starBurst: v.starBurst,
    },
  };
}
