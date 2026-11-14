import { SlantDetail, SlantPanel } from "@components/SlantStage";
import type { LandingChoice } from "@data/landing";
import { cx } from "@utils/cx";

import styles from "./Landing.module.scss";

type LandingPanelProps = {
  choice: LandingChoice;
  align: "start" | "end";
};

/**
 * With a 45° shear the left panel is wide at the top and the right panel
 * wide at the bottom; unpicked content slides that way so it is not clipped.
 */
const UNPICKED_SHIFT: Record<LandingPanelProps["align"], string> = { start: "-16%", end: "16%" };

/** One pick in the chooser; the stat sheet unfurls on hover. */
export function LandingPanel({ choice, align }: LandingPanelProps) {
  return (
    <SlantPanel
      href={choice.href}
      align={align}
      unpickedShift={UNPICKED_SHIFT[align]}
      className={cx(styles.panel, styles[`panel--${choice.id}`])}
    >
      <span className={styles.panel__slot}>{choice.slot}</span>
      <span className={styles.panel__eyebrow}>{choice.eyebrow}</span>
      <span className={styles.panel__title}>{choice.title}</span>
      <span className={styles.panel__tagline}>{choice.tagline}</span>
      <SlantDetail>
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
      </SlantDetail>
    </SlantPanel>
  );
}
