import Link from "next/link";

import type { LandingChoice } from "@data/landing";
import { cx } from "@utils/cx";

import styles from "./Landing.module.scss";

type LandingPanelProps = {
  choice: LandingChoice;
};

/** One pick in the chooser. The whole panel is the link; the detail sheet unfurls on hover. */
export function LandingPanel({ choice }: LandingPanelProps) {
  return (
    <Link href={choice.href} className={cx(styles.panel, styles[`panel--${choice.id}`])}>
      <span className={styles.panel__curtain} aria-hidden="true" />
      <span className={styles.panel__curtain} aria-hidden="true" />
      <span className={styles.panel__inner}>
        <span className={styles.panel__slot}>{choice.slot}</span>
        <span className={styles.panel__eyebrow}>{choice.eyebrow}</span>
        <span className={styles.panel__title}>{choice.title}</span>
        <span className={styles.panel__tagline}>{choice.tagline}</span>
        <span className={styles.panel__detail}>
          <span className={styles.panel__detailInner}>
            <span className={styles.panel__description}>{choice.description}</span>
            <dl className={styles.panel__stats}>
              {choice.stats.map((stat) => (
                <div key={stat.label} className={styles.panel__stat}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
            <span className={styles.panel__cta}>{choice.cta} →</span>
          </span>
        </span>
      </span>
    </Link>
  );
}
