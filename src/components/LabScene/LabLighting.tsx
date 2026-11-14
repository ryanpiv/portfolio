"use client";

import { Stars } from "@react-three/drei";

import type { LightingPreset } from "@data/lab";

type LabLightingProps = {
  lighting: LightingPreset;
};

/** Background, three-point lighting, and the optional starfield. */
export function LabLighting({ lighting }: LabLightingProps) {
  return (
    <>
      <color attach="background" args={[lighting.background]} />
      <ambientLight color={lighting.ambient.color} intensity={lighting.ambient.intensity} />
      <directionalLight
        position={lighting.key.position}
        color={lighting.key.color}
        intensity={lighting.key.intensity}
        castShadow
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
        <Stars radius={70} depth={40} count={1800} factor={3} saturation={0} fade speed={0.35} />
      )}
    </>
  );
}
