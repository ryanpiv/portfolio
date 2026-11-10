"use client";

import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";

import type { PhysicsPreset, SphereMaterialPreset } from "@data/lab";

type UseBodyMotionArgs = {
  bodyRef: React.RefObject<RapierRigidBody>;
  materialRef: React.RefObject<THREE.MeshPhysicalMaterial>;
  physics: PhysicsPreset;
  sphere: SphereMaterialPreset;
  /** Returns the drag target while dragging, else null. */
  dragTarget: () => THREE.Vector3 | null;
  hovered: boolean;
  /** Hovered or dragging — drives the emissive boost. */
  lit: boolean;
};

/** Emissive damping rate (higher = snappier). */
const EMISSIVE_LAMBDA = 10;

const tmpVel = new THREE.Vector3();

/**
 * Per-frame body behavior: follow the drag target as velocity, brake while
 * hovered, clamp top speed, and ease the emissive glow toward its goal.
 */
export function useBodyMotion({
  bodyRef,
  materialRef,
  physics,
  sphere,
  dragTarget,
  hovered,
  lit,
}: UseBodyMotionArgs) {
  useFrame((_, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    const target = dragTarget();
    if (target) {
      const position = body.translation();
      tmpVel
        .set(target.x - position.x, target.y - position.y, target.z - position.z)
        .multiplyScalar(physics.followGain);
      body.setLinvel(tmpVel, true);
    } else {
      const velocity = body.linvel();
      tmpVel.set(velocity.x, velocity.y, velocity.z);
      if (hovered) {
        // Frame-rate independent brake: hoverBrake is the per-60fps factor.
        tmpVel.multiplyScalar(Math.pow(physics.hoverBrake, delta * 60));
        body.setLinvel(tmpVel, true);
      }
    }

    const speed = tmpVel.length();
    if (speed > physics.maxSpeed) {
      tmpVel.multiplyScalar(physics.maxSpeed / speed);
      body.setLinvel(tmpVel, true);
    }

    const material = materialRef.current;
    if (material) {
      const goal = sphere.emissiveIntensity + (lit ? sphere.hoverEmissiveBoost : 0);
      material.emissiveIntensity = THREE.MathUtils.damp(material.emissiveIntensity, goal, EMISSIVE_LAMBDA, delta);
    }
  });
}
