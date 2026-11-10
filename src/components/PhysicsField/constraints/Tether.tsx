"use client";

import { useSpringJoint, type RapierRigidBody } from "@react-three/rapier";

import type { TetherConstraint } from "@data/lab";

type TetherProps = {
  bodyRef: React.RefObject<RapierRigidBody>;
  coreRef: React.RefObject<RapierRigidBody>;
  constraint: TetherConstraint;
};

/**
 * Spring joint between a sphere and the fixed core. Rendered as a child of
 * the sphere's RigidBody so the hook can only exist when the variant needs it.
 */
export function Tether({ bodyRef, coreRef, constraint }: TetherProps) {
  useSpringJoint(coreRef, bodyRef, [
    [0, 0, 0],
    [0, 0, 0],
    constraint.restLength,
    constraint.stiffness,
    constraint.damping,
  ]);
  return null;
}
