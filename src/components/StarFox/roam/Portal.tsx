"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";

import { Nameplate } from "@components/LabScene";
import type { PortalSpot } from "@utils/arenaLayout";

import { hdrColor } from "../combat/hdrColor";
import { useGameFrame } from "../hooks/useGameFrame";
import { useRoam } from "./roamContext";

/** Inner radius you have to fly through. */
export const PORTAL_RADIUS = 6;
const RING_TUBE = 0.35;
const RING_SPIN = 0.6;
/** Nameplates are full size this far from the camera, and shrink beyond it. */
const PLATE_DISTANCE = 60;
const BEAM_RADIUS = 0.12;

/** One project's gateway: a glowing ring on a beam, labelled, in the project's status color. */
export function Portal({ spot }: { spot: PortalSpot }) {
  const { lighting } = useRoam();
  const ring = useRef<THREE.Mesh>(null);
  const color = lighting.statusColors[spot.project.status];
  const glow = useMemo(() => hdrColor(color, lighting.glowGain), [color, lighting.glowGain]);

  useGameFrame((_, delta) => {
    if (ring.current) ring.current.rotation.z += RING_SPIN * delta;
  });

  const [x, y, z] = spot.position;
  return (
    <group position={[x, y, z]} rotation={[0, spot.yaw, 0]}>
      <mesh ref={ring}>
        <torusGeometry args={[PORTAL_RADIUS, RING_TUBE, 12, 48]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[PORTAL_RADIUS, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, -y / 2, 0]}>
        <cylinderGeometry args={[BEAM_RADIUS, BEAM_RADIUS, y, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <group position={[0, PORTAL_RADIUS + 2, 0]}>
        <Nameplate label={spot.project.title} radius={0} color={color} emphasized distanceFactor={PLATE_DISTANCE} />
      </group>
    </group>
  );
}
