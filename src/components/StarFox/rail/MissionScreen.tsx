"use client";

import Link from "next/link";

import { StatusBadge } from "@components/StatusBadge";
import { getProjectBySlug } from "@data/projects";

import type { GameState } from "./gameStore";
import styles from "./MissionScreen.module.scss";

type MissionScreenProps = {
  game: GameState;
  onRetry: () => void;
};

const OUTCOME = {
  complete: { eyebrow: "mission complete", title: "Corneria is clear." },
  failed: { eyebrow: "mission failed", title: "Shield gone." },
} as const;

/** End-of-run card. Rendered only when the run is complete or failed; links each downed fighter to its project. */
export function MissionScreen({ game, onRetry }: MissionScreenProps) {
  if (game.phase !== "complete" && game.phase !== "failed") return null;
  const outcome = OUTCOME[game.phase];
  const shieldPercent = Math.round((100 * game.shield) / game.shieldMax);
  const downed = game.downed.map(getProjectBySlug).filter((p) => p !== undefined);

  return (
    <section className={styles.missionScreen} role="dialog" aria-labelledby="mission-title">
      <p className={styles.missionScreen__eyebrow}>{outcome.eyebrow}</p>
      <h2 id="mission-title" className={styles.missionScreen__title}>
        {outcome.title}
      </h2>
      <p className={styles.missionScreen__summary}>
        {game.hits} of {game.total} fighters down · {game.escaped} got past · {shieldPercent}% shield left
      </p>

      {downed.length > 0 && (
        <>
          <p className={styles.missionScreen__listLabel}>shot down — every fighter was a project</p>
          <ul className={styles.missionScreen__list}>
            {downed.map((project) => (
              <li key={project.slug} className={styles.missionScreen__item}>
                <Link href={`/projects/${project.slug}`} className={styles.missionScreen__link}>
                  {project.title}
                </Link>
                <StatusBadge status={project.status} />
              </li>
            ))}
          </ul>
        </>
      )}

      <button type="button" className={styles.missionScreen__button} onClick={onRetry} autoFocus>
        fly again
      </button>
    </section>
  );
}
