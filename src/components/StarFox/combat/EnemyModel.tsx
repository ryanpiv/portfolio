"use client";

import { useMemo } from "react";

import { hdrColor } from "./hdrColor";

type EnemyModelProps = {
  /** Status color: body tint and the glowing core. */
  color: string;
  /** Neutral hull color for the blades. */
  hull: string;
  /** Preset glow gain for the core. */
  glowGain: number;
};

/** Low-poly fighter: a flattened diamond with two blades, nose toward the player (+z). */
export function EnemyModel({ color, hull, glowGain }: EnemyModelProps) {
  const core = useMemo(() => hdrColor(color, glowGain), [color, glowGain]);
  return (
    <group>
      <mesh scale={[1.1, 0.45, 1.6]} castShadow>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.5} metalness={0.2} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.25, 0, -0.25]} rotation={[0, 0, side * 0.45]} castShadow>
          <boxGeometry args={[1.4, 0.08, 0.9]} />
          <meshStandardMaterial color={hull} roughness={0.7} metalness={0.1} />
        </mesh>
      ))}
      {/* Glowing core facing the player, for bloom */}
      <mesh position={[0, 0, 0.8]}>
        <circleGeometry args={[0.24, 12]} />
        <meshBasicMaterial color={core} toneMapped={false} />
      </mesh>
    </group>
  );
}
