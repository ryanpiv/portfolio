"use client";

import type { GameState } from "./game/gameStore";
import styles from "./MissionScreen.module.scss";

type MissionScreenProps = {
  game: GameState;
  onRetry: () => void;
};

const OUTCOME = {
  complete: { eyebrow: "mission complete", title: "Corneria is clear." },
  failed: { eyebrow: "mission failed", title: "Shield gone." },
} as const;

/** End-of-run card. Rendered only when the run is complete or failed. */
export function MissionScreen({ game, onRetry }: MissionScreenProps) {
  if (game.phase !== "complete" && game.phase !== "failed") return null;
  const outcome = OUTCOME[game.phase];
  const shieldPercent = Math.round((100 * game.shield) / game.shieldMax);

  return (
    <section className={styles.missionScreen} role="dialog" aria-labelledby="mission-title">
      <p className={styles.missionScreen__eyebrow}>{outcome.eyebrow}</p>
      <h2 id="mission-title" className={styles.missionScreen__title}>
        {outcome.title}
      </h2>
      <p className={styles.missionScreen__summary}>
        {game.hits} of {game.total} fighters down · {game.escaped} got past · {shieldPercent}% shield left
      </p>
      <button type="button" className={styles.missionScreen__button} onClick={onRetry} autoFocus>
        fly again
      </button>
    </section>
  );
}
