"use client";

import type { HTMLAttributes, ReactNode } from "react";

import type { LabTheme } from "@data/lab";
import { cx } from "@utils/cx";
import type { DeviceCapability } from "@utils/deviceCapability";

import styles from "./LabStage.module.scss";
import { SceneFallback } from "./SceneFallback";

type LabStageProps = HTMLAttributes<HTMLDivElement> & {
  theme: LabTheme;
  /** `null` until probed; the scene is shown optimistically in the meantime. */
  capability: DeviceCapability | null;
  /** The client-only WebGL scene. Swapped for `SceneFallback` when WebGL is missing. */
  scene: ReactNode;
  /** HUD and overlays, layered above the canvas. */
  children: ReactNode;
};

/**
 * Full-viewport stage shared by every lab page: sits under the sticky nav,
 * paints the theme's canvas color behind the WebGL canvas, and swaps in a
 * plain-HTML fallback when the device cannot do WebGL at all.
 */
export function LabStage({ theme, capability, scene, children, className, ...rest }: LabStageProps) {
  return (
    <div className={cx(styles.stage, styles[`stage--${theme}`], className)} {...rest}>
      <div className={styles.stage__canvas}>{capability?.webgl === false ? <SceneFallback /> : scene}</div>
      {children}
    </div>
  );
}

/** Placeholder while a scene chunk downloads; pass it as `next/dynamic`'s `loading`. */
export function SceneLoading({ children }: { children: ReactNode }) {
  return <p className={styles.stage__loading}>{children}</p>;
}
