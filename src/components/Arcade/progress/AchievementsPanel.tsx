"use client";

import { useState } from "react";

import { achievements } from "@data/lab";
import { useStore } from "@hooks/useStore";
import { cx } from "@utils/cx";
import { achievementProgress, isUnlocked } from "@utils/progress";
import type { ProgressStore } from "@utils/progressStore";

import styles from "./progress.module.scss";

/** Bottom-right unlock count as a toggle; the full list opens upward over the scene. Shared by every mode. */
export function AchievementsPanel({ store }: { store: ProgressStore }) {
  const { stats, unlocked } = useStore(store);
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.panel}>
      <button
        type="button"
        className={styles.panel__toggle}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="achievements-list"
      >
        <span className={styles.panel__label}>achievements</span>
        <span className={styles.panel__count}>
          {unlocked.length} / {achievements.length}
        </span>
      </button>

      {open && (
        <ul id="achievements-list" className={styles.panel__list}>
          {achievements.map((achievement) => {
            const done = isUnlocked(stats, achievement);
            const fraction = achievementProgress(stats, achievement);
            return (
              <li key={achievement.id} className={cx(styles.panel__item, done && styles["panel__item--done"])}>
                <div className={styles.panel__row}>
                  <span className={styles.panel__title}>{achievement.title}</span>
                  <span className={styles.panel__status}>{done ? "✓" : `${Math.round(fraction * 100)}%`}</span>
                </div>
                <p className={styles.panel__description}>{achievement.description}</p>
                <div className={styles.panel__track} aria-hidden="true">
                  <div className={styles.panel__fill} style={{ width: `${fraction * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
