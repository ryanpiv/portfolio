"use client";

import { achievements } from "@data/lab";
import { useStore } from "@hooks/useStore";
import { cx } from "@utils/cx";
import { achievementProgress, isUnlocked } from "@utils/progress";
import type { ProgressStore } from "@utils/progressStore";

import styles from "./progress.module.scss";

/** Every milestone with its progress bar; lives in the settings menu. Shared by every mode. */
export function AchievementsList({ store }: { store: ProgressStore }) {
  const { stats, unlocked } = useStore(store);

  return (
    <div className={styles.list}>
      <p className={styles.list__count}>
        {unlocked.length} / {achievements.length} unlocked
      </p>
      <ul className={styles.list__items}>
        {achievements.map((achievement) => {
          const done = isUnlocked(stats, achievement);
          const fraction = achievementProgress(stats, achievement);
          return (
            <li key={achievement.id} className={cx(styles.list__item, done && styles["list__item--done"])}>
              <div className={styles.list__row}>
                <span className={styles.list__title}>{achievement.title}</span>
                <span className={styles.list__status}>{done ? "✓" : `${Math.round(fraction * 100)}%`}</span>
              </div>
              <p className={styles.list__description}>{achievement.description}</p>
              <div className={styles.list__track} aria-hidden="true">
                <div className={styles.list__fill} style={{ width: `${fraction * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
