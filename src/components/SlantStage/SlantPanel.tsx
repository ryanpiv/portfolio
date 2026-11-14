import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

import { cx } from "@utils/cx";

import styles from "./SlantStage.module.scss";

export type SlantAlign = "start" | "center" | "end";

type SlantPanelProps = {
  href: string;
  /** Which side the content hugs; the overhang padding goes on the outer side. */
  align?: SlantAlign;
  /** Vertical shift (CSS length / %) applied to the content when another panel is picked. */
  unpickedShift?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** One pick: the whole panel is the link. Content sits in an upright inner box behind two curtains. */
export function SlantPanel({ href, align = "center", unpickedShift, className, style, children }: SlantPanelProps) {
  const vars = { ...style, "--unpicked-shift": unpickedShift ?? "0px" } as CSSProperties;
  return (
    <Link href={href} className={cx(styles.panel, styles[`panel--${align}`], className)} style={vars}>
      <span className={styles.panel__backdrop} aria-hidden="true" />
      <span className={styles.panel__curtain} aria-hidden="true" />
      <span className={styles.panel__curtain} aria-hidden="true" />
      <span className={styles.panel__inner}>{children}</span>
    </Link>
  );
}
