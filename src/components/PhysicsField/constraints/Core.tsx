"use client";

import { BallCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";

import { useField } from "../fieldContext";
import { TetherLines } from "./TetherLines";

type CoreProps = {
  coreRef: React.RefObject<RapierRigidBody>;
};

const CORE_RADIUS = 0.6;

/** Fixed body at the origin that tethered spheres hang from. */
export function Core({ coreRef }: CoreProps) {
  const { settings } = useField();
  const { core } = settings.lighting;

  return (
    <>
      <RigidBody ref={coreRef} type="fixed" colliders={false} position={[0, 0, 0]}>
        <BallCollider args={[CORE_RADIUS]} />
        <mesh>
          <sphereGeometry args={[CORE_RADIUS, 32, 32]} />
          <meshStandardMaterial
            color={core.color}
            emissive={core.color}
            emissiveIntensity={core.emissiveIntensity}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      </RigidBody>
      {settings.view.tetherLines && <TetherLines color={core.color} />}
    </>
  );
}
