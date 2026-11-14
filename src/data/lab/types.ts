import type { ProjectStatus } from "@data/projects";

/* ----------------------------------------------------------------------------
 * Variants & constraints
 * ------------------------------------------------------------------------- */

export type LabVariantId = "caged" | "tethered" | "attractor";
export type LabTheme = "dark" | "light";

export type CageConstraint = {
  kind: "cage";
  /** Depth of the box along the camera axis (world units). */
  depth: number;
  /** Bounciness of the invisible walls (0 = dead stop, 1 = perfect bounce). */
  wallRestitution: number;
};

export type TetherConstraint = {
  kind: "tether";
  restLength: number;
  stiffness: number;
  damping: number;
};

export type AttractorConstraint = {
  kind: "attractor";
  /** Acceleration toward the origin at the ramp distance (world units / s²). */
  strength: number;
  /** No pull inside this radius — spheres drift freely in the middle. */
  innerRadius: number;
  /** Distance past `innerRadius` over which the pull ramps to full. */
  rampDistance: number;
  /** Outer safety walls so a hard fling cannot leave the frustum for long. */
  safetyCageScale: number;
};

export type FieldConstraint = CageConstraint | TetherConstraint | AttractorConstraint;
export type FieldConstraintKind = FieldConstraint["kind"];

export type PhysicsPreset = {
  linearDamping: number;
  angularDamping: number;
  restitution: number;
  friction: number;
  /** Initial drift speed range, world units / s. */
  initialSpeed: [min: number, max: number];
  /** Per-frame velocity multiplier while hovered (lower = stronger brake). */
  hoverBrake: number;
  /** Velocity gain while dragging: v = (target − pos) × followGain. */
  followGain: number;
  /** Hard cap on speed after a fling, world units / s. */
  maxSpeed: number;
};

export type LabVariant = {
  id: LabVariantId;
  title: string;
  tagline: string;
  description: string;
  constraint: FieldConstraint;
  physics: PhysicsPreset;
};

/* ----------------------------------------------------------------------------
 * Visitor-facing view options (HUD controls, carried in the URL)
 * ------------------------------------------------------------------------- */

export type NameplateMode = "always" | "hover" | "off";

export type FieldViewOptions = {
  nameplates: NameplateMode;
  /** Draw tether lines (tethered variant only). */
  tetherLines: boolean;
};

/* ----------------------------------------------------------------------------
 * Lighting
 * ------------------------------------------------------------------------- */

export type LightSpec = {
  position: [x: number, y: number, z: number];
  color: string;
  intensity: number;
};

export type SphereMaterialPreset = {
  emissiveIntensity: number;
  roughness: number;
  metalness: number;
  clearcoat: number;
  /** Emissive boost applied on hover. */
  hoverEmissiveBoost: number;
};

/** Soft glow sprite around each body — the "star" read. */
export type HaloPreset = {
  /** Sprite diameter as a multiple of the sphere radius. */
  scale: number;
  opacity: number;
  /** Twinkle amplitude (0 = steady) and speed (rad/s). */
  twinkle: number;
  twinkleSpeed: number;
  /** Additive blending glows on dark; normal blending reads on light. */
  additive: boolean;
};

export type BloomPreset = {
  intensity: number;
  luminanceThreshold: number;
  luminanceSmoothing: number;
  radius: number;
};

export type FlarePreset = {
  enabled: boolean;
  colorGain: string;
  glareSize: number;
  flareSize: number;
  haloScale: number;
  ghostScale: number;
  starBurst: boolean;
};

export type LightingPreset = {
  background: string;
  /** Color for in-scene labels. */
  text: string;
  ambient: { color: string; intensity: number };
  key: LightSpec;
  fill: LightSpec;
  rim: LightSpec;
  sphere: SphereMaterialPreset;
  halo: HaloPreset;
  bloom: BloomPreset;
  flare: FlarePreset;
  core: { color: string; emissiveIntensity: number };
  stars: boolean;
  /** Per-status sphere colors. */
  statusColors: Record<ProjectStatus, string>;
  /** Multiplier for unlit glow surfaces (lasers, cores, debris) so they clear the bloom threshold; 1 = no boost. */
  glowGain: number;
};
