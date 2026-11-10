"use client";

import { useMemo } from "react";
import { useThree } from "@react-three/fiber";

export type FieldBounds = {
  halfWidth: number;
  halfHeight: number;
  halfDepth: number;
};

/**
 * Half-extents of the play volume. Width/height are measured at the plane
 * *nearest* the camera (z = +halfDepth) so a sphere drifting forward still
 * sits inside the visible frame.
 */
export function useFieldBounds(halfDepth: number): FieldBounds {
  const viewport = useThree((state) => state.viewport);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  return useMemo(() => {
    const near = viewport.getCurrentViewport(camera, [0, 0, halfDepth], size);
    return { halfWidth: near.width / 2, halfHeight: near.height / 2, halfDepth };
  }, [viewport, camera, halfDepth, size]);
}
