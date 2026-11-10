import type { Schema } from "leva/dist/declarations/src/types";

import type { FieldConstraint } from "@data/lab";

import { num, slider } from "./schema";

/** Default half-depth of the play volume when the constraint has no depth of its own. */
const DEFAULT_DEPTH = 6;

export function constraintDepth(constraint: FieldConstraint): number {
  return constraint.kind === "cage" ? constraint.depth : DEFAULT_DEPTH;
}

/** Leva schema for the tunable fields of the active constraint. */
export function constraintSchema(constraint: FieldConstraint): Schema {
  switch (constraint.kind) {
    case "cage":
      return { wallRestitution: slider(constraint.wallRestitution, 0, 1, 0.01) };
    case "tether":
      return {
        restLength: slider(constraint.restLength, 0, 12, 0.1),
        stiffness: slider(constraint.stiffness, 0, 20, 0.1),
        damping: slider(constraint.damping, 0, 5, 0.05),
      };
    case "attractor":
      return {
        strength: slider(constraint.strength, 0, 12, 0.1),
        innerRadius: slider(constraint.innerRadius, 0, 12, 0.25),
        rampDistance: slider(constraint.rampDistance, 0.5, 12, 0.25),
        safetyCageScale: slider(constraint.safetyCageScale, 1, 3, 0.05),
      };
  }
}

/** Overlay Leva values (untyped) onto the preset constraint. */
export function mergeConstraint(base: FieldConstraint, values: Record<string, unknown>): FieldConstraint {
  switch (base.kind) {
    case "cage":
      return { ...base, wallRestitution: num(values.wallRestitution, base.wallRestitution) };
    case "tether":
      return {
        ...base,
        restLength: num(values.restLength, base.restLength),
        stiffness: num(values.stiffness, base.stiffness),
        damping: num(values.damping, base.damping),
      };
    case "attractor":
      return {
        ...base,
        strength: num(values.strength, base.strength),
        innerRadius: num(values.innerRadius, base.innerRadius),
        rampDistance: num(values.rampDistance, base.rampDistance),
        safetyCageScale: num(values.safetyCageScale, base.safetyCageScale),
      };
  }
}
