"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";

import type { FieldBounds } from "../hooks/useFieldBounds";

type CageProps = {
  bounds: FieldBounds;
  restitution: number;
};

const WALL = 1;

/**
 * Six invisible walls around the play volume. Sized from the camera frustum
 * so spheres bounce exactly at the viewport edge.
 */
export function Cage({ bounds, restitution }: CageProps) {
  const x = bounds.halfWidth + WALL;
  const y = bounds.halfHeight + WALL;
  const z = bounds.halfDepth + WALL;
  return (
    <RigidBody type="fixed" colliders={false} restitution={restitution} friction={0}>
      <CuboidCollider args={[WALL, y, z]} position={[-x, 0, 0]} />
      <CuboidCollider args={[WALL, y, z]} position={[x, 0, 0]} />
      <CuboidCollider args={[x, WALL, z]} position={[0, -y, 0]} />
      <CuboidCollider args={[x, WALL, z]} position={[0, y, 0]} />
      <CuboidCollider args={[x, y, WALL]} position={[0, 0, -z]} />
      <CuboidCollider args={[x, y, WALL]} position={[0, 0, z]} />
    </RigidBody>
  );
}
