import type { CSSProperties, ReactNode } from "react";

import { cx } from "@utils/cx";

import styles from "./SlantStage.module.scss";

type SlantStageProps = {
  /** Shear angle in degrees; the divider between panels leans by this much. */
  slant: number;
  /** flex-grow of the picked panel; the others stay at 1. */
  expand: number;
  /** CSS length for the stage height (the overhang is derived from it). */
  height: string;
  /** Accessible name for the group of choices. */
  label: string;
  /**
   * Oversize the row by the shear overhang so the sheared ends never show
   * (full-bleed stages). Off, the strip keeps its width and its ends slant.
   */
  bleed?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Character-select strip: a row of `SlantPanel`s sheared so their dividers
 * run diagonally. Hovering or focusing a panel widens it, parts its curtains
 * and sets `--panel-picked: 1`; the others get `--panel-scale` / 
 * `--panel-secondary` so their content can step back. Pure CSS. Stacks
 * vertically, unsheared, below the medium breakpoint.
 */
export function SlantStage({ slant, expand, height, label, bleed = true, className, children }: SlantStageProps) {
  const style = { "--slant": `${slant}deg`, "--expand": expand, "--stage-height": height } as CSSProperties;
  return (
    <div className={cx(styles.stage, bleed && styles["stage--bleed"], className)} style={style} role="group" aria-label={label}>
      <div className={styles.stage__row}>{children}</div>
    </div>
  );
}
