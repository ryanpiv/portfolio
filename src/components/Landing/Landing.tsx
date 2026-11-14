import type { LandingChoice } from "@data/landing";

import styles from "./Landing.module.scss";
import { LandingPanel } from "./LandingPanel";

type LandingProps = {
  choices: LandingChoice[];
};

/**
 * Homepage chooser: two slanted panels side by side, like a character-select
 * screen. Hovering (or focusing) one widens it and parts its curtain to show
 * the detail sheet; clicking goes to that way of browsing. Pure CSS — no state.
 */
export function Landing({ choices }: LandingProps) {
  return (
    <section className={styles.landing} aria-label="Choose how to browse the projects">
      <div className={styles.landing__stage}>
        {choices.map((choice) => (
          <LandingPanel key={choice.id} choice={choice} />
        ))}
      </div>
      <p className={styles.landing__hint} aria-hidden="true">
        hover to preview · click to choose
      </p>
    </section>
  );
}
