"use client";

type ShipModelProps = {
  /** Hull color. */
  color: string;
  /** Wing stripe / canopy accent. */
  accent: string;
  /** Engine glow. */
  glow: string;
};

const HULL = { roughness: 0.6, metalness: 0.15 };

/**
 * Low-poly fighter-style wedge built from primitives. Nose points −z (into the
 * screen), engines at +z. About 5 units long, 5 wide.
 */
export function ShipModel({ color, accent, glow }: ShipModelProps) {
  return (
    <group>
      {/* Nose: 4-sided pyramid pointing −z */}
      <mesh position={[0, 0, -2.2]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} castShadow>
        <coneGeometry args={[0.55, 2.4, 4]} />
        <meshStandardMaterial color={color} {...HULL} />
      </mesh>

      {/* Fuselage */}
      <mesh position={[0, 0, 0.2]} castShadow>
        <boxGeometry args={[0.95, 0.6, 2.6]} />
        <meshStandardMaterial color={color} {...HULL} />
      </mesh>

      {/* Canopy */}
      <mesh position={[0, 0.45, -0.3]} castShadow>
        <boxGeometry args={[0.45, 0.3, 1.1]} />
        <meshStandardMaterial color={accent} roughness={0.2} metalness={0.6} />
      </mesh>

      {/* Wings: swept down and out */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.5, -0.1, 0.6]} rotation={[0, 0, side * -0.32]}>
          <mesh position={[side * 1.3, 0, 0]} castShadow>
            <boxGeometry args={[2.6, 0.1, 1.4]} />
            <meshStandardMaterial color={color} {...HULL} />
          </mesh>
          {/* Wing stripe */}
          <mesh position={[side * 1.3, 0.06, 0]}>
            <boxGeometry args={[2.2, 0.02, 0.25]} />
            <meshStandardMaterial color={accent} roughness={0.5} />
          </mesh>
          {/* Wingtip fin */}
          <mesh position={[side * 2.6, 0.35, 0.1]} castShadow>
            <boxGeometry args={[0.1, 0.8, 1]} />
            <meshStandardMaterial color={color} {...HULL} />
          </mesh>
        </group>
      ))}

      {/* Tail fins */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.35, 0.55, 1.2]} rotation={[0, 0, side * 0.5]} castShadow>
          <boxGeometry args={[0.08, 0.9, 0.9]} />
          <meshStandardMaterial color={color} {...HULL} />
        </mesh>
      ))}

      {/* Engine glow: a bright disc for bloom to pick up, facing the camera at +z */}
      <mesh position={[0, 0, 1.52]}>
        <circleGeometry args={[0.28, 16]} />
        <meshBasicMaterial color={glow} />
      </mesh>
      <pointLight position={[0, 0, 2.2]} color={glow} intensity={1.5} distance={6} decay={2} />
    </group>
  );
}
