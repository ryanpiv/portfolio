import type { LabVariant, LabVariantId, PhysicsPreset } from "./types";

/**
 * Every variant shares the same scene (spheres from the project registry,
 * collisions, drag/fling, hover-slow, click → project page). Only the
 * constraint that keeps spheres on screen differs. Numbers here are the
 * starting point for live tuning in the Leva panel; promote tuned values
 * back into this file.
 */

const basePhysics: PhysicsPreset = {
  linearDamping: 0.08,
  angularDamping: 0.4,
  restitution: 0.55,
  friction: 0.2,
  initialSpeed: [0.4, 1.6],
  hoverBrake: 0.9,
  followGain: 14,
  maxSpeed: 24,
};

export const labVariants: LabVariant[] = [
  {
    id: "caged",
    title: "Caged",
    tagline: "Asteroids in a box.",
    description:
      "Spheres drift inside an invisible box fitted to the viewport. They bounce off the walls and each other; nothing ever leaves the screen.",
    constraint: { kind: "cage", depth: 7, wallRestitution: 0.8 },
    physics: basePhysics,
  },
  {
    id: "tethered",
    title: "Tethered",
    tagline: "Everything on a spring to the core.",
    description:
      "Each sphere hangs on a spring joint to a fixed core. Fling one and it sails out, slows, and swings back. No walls.",
    constraint: { kind: "tether", restLength: 6.5, stiffness: 1.4, damping: 0.7 },
    physics: { ...basePhysics, linearDamping: 0.25, initialSpeed: [0.6, 2.2] },
  },
  {
    id: "attractor",
    title: "Attractor",
    tagline: "Soft gravity, no strings.",
    description:
      "Spheres drift freely inside an inner radius; stray past it and a soft pull eases them back. No joints, no hard walls. Softer than tethers, less contained than a cage.",
    constraint: {
      kind: "attractor",
      strength: 3,
      innerRadius: 5,
      rampDistance: 4,
      safetyCageScale: 1.6,
    },
    physics: { ...basePhysics, linearDamping: 0.05 },
  },
];

export function getLabVariant(id: string): LabVariant | undefined {
  return labVariants.find((variant) => variant.id === id);
}

export function getAllLabVariantIds(): LabVariantId[] {
  return labVariants.map((variant) => variant.id);
}
