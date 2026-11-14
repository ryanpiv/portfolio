import { cx } from "@utils/cx";

import styles from "./ShieldBar.module.scss";

type ShieldBarProps = {
  shield: number;
  shieldMax: number;
};

/** Fill turns amber under this fraction and purple under the critical one. */
const WARN_BELOW = 0.6;
const CRITICAL_BELOW = 0.3;

export function ShieldBar({ shield, shieldMax }: ShieldBarProps) {
  const fraction = shieldMax > 0 ? shield / shieldMax : 0;
  const percent = Math.round(fraction * 100);
  const tone = fraction < CRITICAL_BELOW ? "critical" : fraction < WARN_BELOW ? "warn" : null;

  return (
    <div className={styles.shield}>
      <span className={styles.shield__label}>shield</span>
      <div
        className={styles.shield__track}
        role="meter"
        aria-label="Shield"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className={cx(styles.shield__fill, tone && styles[`shield__fill--${tone}`])} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
