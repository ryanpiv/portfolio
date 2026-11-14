"use client";

import { Stars } from "@react-three/drei";

import type { LightingPreset } from "@data/lab";

type LabLightingProps = {
  lighting: LightingPreset;
  /** Inner radius of the starfield; scenes with a big floor push it out past the fog. */
  starRadius?: number;
};

/** Background, three-point lighting, and the optional starfield. */
export function LabLighting({ lighting, starRadius = 70 }: LabLightingProps) {
  return (
    <>
      <color attach="background" args={[lighting.background]} />
      <ambientLight color={lighting.ambient.color} intensity={lighting.ambient.intensity} />
      <directionalLight
        position={lighting.key.position}
        color={lighting.key.color}
        intensity={lighting.key.intensity}
        castShadow
        shadow-bias={-0.0002}
        shadow-normalBias={0.05}
      />
      <pointLight
        position={lighting.fill.position}
        color={lighting.fill.color}
        intensity={lighting.fill.intensity}
        distance={60}
        decay={1.2}
      />
      <directionalLight
        position={lighting.rim.position}
        color={lighting.rim.color}
        intensity={lighting.rim.intensity}
      />
      {lighting.stars && (
        <Stars radius={starRadius} depth={starRadius * 0.6} count={1800} factor={3} saturation={0} fade speed={0.35} />
      )}
    </>
  );
}
