"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useField } from "../fieldContext";

type TetherLinesProps = {
  color: string;
};

/** Upper bound on bodies the line buffer can hold. */
const MAX_LINES = 64;
const FLOATS_PER_LINE = 2 * 3;

/** One LineSegments from the origin to every registered body, refreshed per frame. */
export function TetherLines({ color }: TetherLinesProps) {
  const { bodies } = useField();
  const lines = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_LINES * FLOATS_PER_LINE);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setDrawRange(0, 0);
    return geo;
  }, []);

  useFrame(() => {
    if (!lines.current) return;
    const attribute = geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = attribute.array as Float32Array;
    let i = 0;
    for (const ref of bodies.values()) {
      const body = ref.current;
      if (!body || i + FLOATS_PER_LINE > array.length) continue;
      const p = body.translation();
      array.set([0, 0, 0, p.x, p.y, p.z], i);
      i += FLOATS_PER_LINE;
    }
    geometry.setDrawRange(0, i / 3);
    attribute.needsUpdate = true;
  });

  return (
    <lineSegments ref={lines} geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial color={color} transparent opacity={0.28} depthWrite={false} />
    </lineSegments>
  );
}
