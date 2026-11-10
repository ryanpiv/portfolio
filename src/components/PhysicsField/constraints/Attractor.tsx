"use client";

import { useBeforePhysicsStep } from "@react-three/rapier";
import * as THREE from "three";

import type { AttractorConstraint } from "@data/lab";

import { useField } from "../fieldContext";

type AttractorProps = {
  constraint: AttractorConstraint;
};

const force = new THREE.Vector3();

/**
 * Soft pull toward the origin with a dead zone: nothing inside
 * `innerRadius`, ramping linearly to `strength` over `rampDistance`, then
 * constant. Force scales with mass so every sphere accelerates equally.
 */
export function Attractor({ constraint }: AttractorProps) {
  const { bodies, dragging } = useField();
  const { strength, innerRadius, rampDistance } = constraint;

  useBeforePhysicsStep(() => {
    for (const [slug, ref] of bodies) {
      const body = ref.current;
      if (!body) continue;
      body.resetForces(true);
      if (slug === dragging) continue;

      const p = body.translation();
      force.set(-p.x, -p.y, -p.z);
      const distance = force.length();
      if (distance <= innerRadius) continue;

      const t = Math.min((distance - innerRadius) / Math.max(rampDistance, 1e-3), 1);
      force.multiplyScalar((strength * t * body.mass()) / distance);
      body.addForce(force, true);
    }
  });

  return null;
}
