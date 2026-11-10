"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import type { HaloPreset } from "@data/lab";

import { getHaloTexture } from "./haloTexture";

type StarHaloProps = {
  radius: number;
  color: string;
  halo: HaloPreset;
  /** Per-body phase so the field does not twinkle in unison. */
  phase: number;
  boosted: boolean;
};

const BOOST_FACTOR = 1.5;
const OPACITY_LERP = 0.15;

/** Billboarded glow sprite that makes a sphere read as a star. */
export function StarHalo({ radius, color, halo, phase, boosted }: StarHaloProps) {
  const material = useRef<THREE.SpriteMaterial>(null!);
  const texture = useMemo(() => getHaloTexture(), []);
  const size = radius * halo.scale;

  useFrame(({ clock }) => {
    if (!material.current) return;
    const twinkle = 1 + halo.twinkle * Math.sin(clock.elapsedTime * halo.twinkleSpeed + phase);
    const target = halo.opacity * twinkle * (boosted ? BOOST_FACTOR : 1);
    material.current.opacity = THREE.MathUtils.lerp(material.current.opacity, target, OPACITY_LERP);
  });

  return (
    <sprite scale={[size, size, 1]} renderOrder={-1}>
      <spriteMaterial
        ref={material}
        map={texture}
        color={color}
        transparent
        opacity={halo.opacity}
        depthWrite={false}
        blending={halo.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </sprite>
  );
}
