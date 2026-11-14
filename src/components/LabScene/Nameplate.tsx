"use client";

import { Html } from "@react-three/drei";

type NameplateProps = {
  label: string;
  /** Body radius; the plate hangs just below it. */
  radius: number;
  color: string;
  emphasized?: boolean;
  /** When set, the label shrinks with distance (full size at this many world units from the camera). */
  distanceFactor?: number;
};

const PLATE_GAP = 0.5;

/** DOM label anchored under a body. Never intercepts the pointer. */
export function Nameplate({ label, radius, color, emphasized = false, distanceFactor }: NameplateProps) {
  return (
    <Html
      center
      position={[0, -(radius + PLATE_GAP), 0]}
      style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
      zIndexRange={[5, 0]}
      distanceFactor={distanceFactor}
    >
      <span
        style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: emphasized ? 12 : 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color,
          opacity: emphasized ? 1 : 0.72,
          transition: "opacity 160ms ease, font-size 160ms ease",
        }}
      >
        {label}
      </span>
    </Html>
  );
}
