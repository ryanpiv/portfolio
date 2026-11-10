"use client";

import type { RapierRigidBody } from "@react-three/rapier";

import type { FieldConstraint } from "@data/lab";

import type { FieldBounds } from "../hooks/useFieldBounds";
import { Attractor } from "./Attractor";
import { Cage } from "./Cage";
import { Core } from "./Core";

type ConstraintsProps = {
  constraint: FieldConstraint;
  bounds: FieldBounds;
  coreRef: React.RefObject<RapierRigidBody>;
};

/** Restitution of the attractor's far-out safety walls. */
const SAFETY_WALL_RESTITUTION = 0.4;

/** Mounts whatever keeps spheres on screen for the active variant. */
export function Constraints({ constraint, bounds, coreRef }: ConstraintsProps) {
  switch (constraint.kind) {
    case "cage":
      return <Cage bounds={bounds} restitution={constraint.wallRestitution} />;
    case "tether":
      return <Core coreRef={coreRef} />;
    case "attractor":
      return (
        <>
          <Cage bounds={scaleBounds(bounds, constraint.safetyCageScale)} restitution={SAFETY_WALL_RESTITUTION} />
          <Attractor constraint={constraint} />
        </>
      );
  }
}

function scaleBounds(bounds: FieldBounds, scale: number): FieldBounds {
  return {
    halfWidth: bounds.halfWidth * scale,
    halfHeight: bounds.halfHeight * scale,
    halfDepth: bounds.halfDepth * scale,
  };
}
