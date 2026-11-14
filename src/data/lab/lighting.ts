import type { LabTheme, LightingPreset } from "./types";

/**
 * Lighting presets (Metroid Prime "Light Suit" direction).
 * Dark: luminous spheres, bloom, lens flare on the key light.
 * Light: the lit world — darker spheres, bright rims, flare off by default.
 */

const dark: LightingPreset = {
  background: "#0c0c0e",
  text: "#f2f2f0",
  ambient: { color: "#8ab4d4", intensity: 0.15 },
  key: { position: [-9, 7, 6], color: "#fff4e0", intensity: 2.2 },
  fill: { position: [8, -3, 5], color: "#8ab4d4", intensity: 0.8 },
  rim: { position: [0, 4, -9], color: "#e8e4d9", intensity: 2.5 },
  sphere: {
    emissiveIntensity: 0.85,
    roughness: 0.6,
    metalness: 0.05,
    clearcoat: 0.15,
    hoverEmissiveBoost: 0.9,
  },
  halo: { scale: 8, opacity: 0.6, twinkle: 0.18, twinkleSpeed: 1.6, additive: true },
  bloom: { intensity: 1.1, luminanceThreshold: 0.72, luminanceSmoothing: 0.3, radius: 0.7 },
  flare: {
    enabled: true,
    colorGain: "#fff4e0",
    glareSize: 0.08,
    flareSize: 0.004,
    haloScale: 0.22,
    ghostScale: 0.06,
    starBurst: true,
  },
  core: { color: "#e8e4d9", emissiveIntensity: 2.4 },
  stars: true,
  statusColors: {
    live: "#a8f0c4",
    "in-progress": "#f0dc96",
    "rewrite-planned": "#d9b8ff",
    showcase: "#9cc8f0",
  },
  glowGain: 2.2,
};

const light: LightingPreset = {
  background: "#f2f2f0",
  text: "#0c0c0e",
  ambient: { color: "#ffffff", intensity: 0.6 },
  key: { position: [-9, 7, 6], color: "#ffffff", intensity: 3.2 },
  fill: { position: [8, -3, 5], color: "#dfe7ee", intensity: 0.9 },
  rim: { position: [0, 4, -9], color: "#ffffff", intensity: 2 },
  sphere: {
    emissiveIntensity: 0.35,
    roughness: 0.45,
    metalness: 0.1,
    clearcoat: 0.6,
    hoverEmissiveBoost: 0.6,
  },
  halo: { scale: 4, opacity: 0.22, twinkle: 0.1, twinkleSpeed: 1.2, additive: false },
  bloom: { intensity: 0.35, luminanceThreshold: 0.92, luminanceSmoothing: 0.2, radius: 0.5 },
  flare: {
    enabled: false,
    colorGain: "#ffffff",
    glareSize: 0.2,
    flareSize: 0.006,
    haloScale: 0.3,
    ghostScale: 0.15,
    starBurst: false,
  },
  core: { color: "#1c1c22", emissiveIntensity: 0.2 },
  stars: false,
  statusColors: {
    live: "#2f8a5b",
    "in-progress": "#a88a1d",
    "rewrite-planned": "#7d4fb0",
    showcase: "#2e6f9c",
  },
  glowGain: 1,
};

export const labLighting: Record<LabTheme, LightingPreset> = { dark, light };
