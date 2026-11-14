"use client";

import { Bloom, EffectComposer, LensFlare } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

import type { LightingPreset, QualityPreset } from "@data/lab";

type LabEffectsProps = {
  lighting: LightingPreset;
  quality: QualityPreset;
};

/**
 * Bloom on bright surfaces plus a lens flare anchored to the key light.
 * Skipped entirely on tiers without effects: the composer is the single
 * most expensive thing in these scenes.
 */
export function LabEffects({ lighting, quality }: LabEffectsProps) {
  const { bloom, flare, key } = lighting;
  if (!quality.effects) return null;
  return (
    <EffectComposer multisampling={quality.multisampling}>
      <Bloom
        intensity={bloom.intensity}
        luminanceThreshold={bloom.luminanceThreshold}
        luminanceSmoothing={bloom.luminanceSmoothing}
        radius={bloom.radius}
        mipmapBlur
      />
      {flare.enabled ? (
        <LensFlare
          blendFunction={BlendFunction.SCREEN}
          lensPosition={key.position}
          colorGain={new THREE.Color(flare.colorGain)}
          glareSize={flare.glareSize}
          flareSize={flare.flareSize}
          haloScale={flare.haloScale}
          ghostScale={flare.ghostScale}
          starBurst={flare.starBurst}
          secondaryGhosts
          aditionalStreaks={false}
          animated
          flareSpeed={0.3}
          starPoints={6}
          opacity={0.7}
        />
      ) : null}
    </EffectComposer>
  );
}
