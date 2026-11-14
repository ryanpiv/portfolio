"use client";

import type { ReactNode } from "react";
import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, type CanvasProps } from "@react-three/fiber";

import type { QualityPreset } from "@data/lab";

type LabCanvasProps = {
  quality: QualityPreset;
  /** Called when the frame rate sags for a while; the owner should step the tier down. */
  onDegrade?: () => void;
  camera: CanvasProps["camera"];
  children: ReactNode;
};

/** Frames below this many fps (sampled over `DEGRADE_SAMPLE_MS`) count as a decline. */
const DEGRADE_BELOW_FPS = 40;
const DEGRADE_SAMPLE_MS = 2000;

/**
 * The one `<Canvas>` every lab scene renders into. Spends only what the
 * quality tier allows and watches the frame rate so a struggling device is
 * stepped down rather than left to stutter.
 */
export function LabCanvas({ quality, onDegrade, camera, children }: LabCanvasProps) {
  return (
    <Canvas
      shadows={quality.shadows}
      dpr={quality.dpr}
      camera={camera}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      style={{ touchAction: "none" }}
    >
      {onDegrade && (
        <PerformanceMonitor bounds={() => [DEGRADE_BELOW_FPS, Infinity]} ms={DEGRADE_SAMPLE_MS} onDecline={onDegrade} />
      )}
      {children}
    </Canvas>
  );
}
