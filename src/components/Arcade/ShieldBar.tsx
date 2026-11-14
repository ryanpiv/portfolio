"use client";

import { useState } from "react";

import { cx } from "@utils/cx";

import styles from "./ShieldBar.module.scss";

type ShieldBarProps = {
  shield: number;
  shieldMax: number;
  /** Rail calls it a shield; free roam a hull. */
  label?: string;
};

/** Fill turns amber under this fraction and purple under the critical one. */
const WARN_BELOW = 0.6;
const CRITICAL_BELOW = 0.3;

/**
 * Vitals bar, top centre: a wide segmented track whose fill drains from the
 * ends toward the middle and flashes when it drops. Recolours as it falls.
 */
export function ShieldBar({ shield, shieldMax, label = "shield" }: ShieldBarProps) {
  const fraction = shieldMax > 0 ? Math.max(0, Math.min(1, shield / shieldMax)) : 0;
  const percent = Math.round(fraction * 100);
  const tone = fraction < CRITICAL_BELOW ? "critical" : fraction < WARN_BELOW ? "warn" : null;

  // Count drops so the flash animation restarts on each hit (derived state, set during render).
  const [seen, setSeen] = useState({ shield, hits: 0 });
  if (shield !== seen.shield) setSeen({ shield, hits: shield < seen.shield ? seen.hits + 1 : seen.hits });

  return (
    <div className={cx(styles.shield, tone && styles[`shield--${tone}`])}>
      <div
        className={styles.shield__track}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div key={seen.hits} className={styles.shield__fill} style={{ width: `${percent}%` }} />
        <div className={styles.shield__segments} aria-hidden="true" />
      </div>
      <div className={styles.shield__meta}>
        <span className={styles.shield__label}>{label}</span>
        <span className={styles.shield__value}>{percent}</span>
      </div>
    </div>
  );
}
