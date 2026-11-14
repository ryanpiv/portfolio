import type { ReactNode } from "react";

import type { LabTheme } from "@data/lab";
import { cx } from "@utils/cx";

import styles from "./LabHud.module.scss";

type LabHudProps = {
  theme: LabTheme;
  eyebrow: string;
  title: string;
  tagline?: string;
  /** Top-right stack: variant nav, theme/view toggles. */
  switches?: ReactNode;
  /** Panel rendered under the switches (Leva). */
  controls?: ReactNode;
  /** Bottom row, laid out space-between. */
  footer?: ReactNode;
};

/**
 * Overlay chrome shared by every /lab experience. Pointer events pass
 * through to the canvas except on the switches, controls, and anything a
 * child opts back in. Children read the `--hud-*` custom properties.
 */
export function LabHud({ theme, eyebrow, title, tagline, switches, controls, footer }: LabHudProps) {
  return (
    <div className={cx(styles.labHud, styles[`labHud--${theme}`])} data-theme={theme}>
      <header className={styles.labHud__top}>
        <div>
          <p className={styles.labHud__eyebrow}>{eyebrow}</p>
          <h1 className={styles.labHud__title}>{title}</h1>
          {tagline && <p className={styles.labHud__tagline}>{tagline}</p>}
        </div>
        {(switches || controls) && (
          <div className={styles.labHud__switches}>
            {switches}
            {controls && <div className={styles.labHud__controls}>{controls}</div>}
          </div>
        )}
      </header>

      {footer && <footer className={styles.labHud__bottom}>{footer}</footer>}
    </div>
  );
}

type LabHudCardProps = {
  children: ReactNode;
  /** Announce content changes (hover cards, status). */
  live?: boolean;
};

/** Translucent card for the footer. */
export function LabHudCard({ children, live = false }: LabHudCardProps) {
  return (
    <div className={styles.labHud__card} aria-live={live ? "polite" : undefined}>
      {children}
    </div>
  );
}

/** Small mono hint line. */
export function LabHudHint({ children }: { children: ReactNode }) {
  return <p className={styles.labHud__hint}>{children}</p>;
}
