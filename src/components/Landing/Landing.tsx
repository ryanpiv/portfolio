import { SlantStage } from "@components/SlantStage";
import type { LandingChoice } from "@data/landing";

import styles from "./Landing.module.scss";
import { LandingPanel } from "./LandingPanel";

type LandingProps = {
  choices: LandingChoice[];
};

/** Shear of the divider between the two ways in. */
const SLANT_DEG = 45;
/** How much wider the picked panel gets. */
const EXPAND = 2.4;

/**
 * Homepage chooser: two slanted panels side by side, like a character-select
 * screen. Hovering (or focusing) one widens it and parts its curtain to show
 * the detail sheet; clicking goes to that way of browsing.
 */
export function Landing({ choices }: LandingProps) {
  return (
    <section className={styles.landing} aria-label="Choose how to browse the projects">
      <SlantStage slant={SLANT_DEG} expand={EXPAND} height="var(--landing-height)" label="Ways in">
        {choices.map((choice, index) => (
          <LandingPanel key={choice.id} choice={choice} align={index === 0 ? "start" : "end"} />
        ))}
      </SlantStage>
      <p className={styles.landing__hint} aria-hidden="true">
        hover to preview · click to choose
      </p>
    </section>
  );
}
