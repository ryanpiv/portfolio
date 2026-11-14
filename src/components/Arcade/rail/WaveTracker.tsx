import { cx } from "@utils/cx";

import type { GameState } from "./gameStore";
import styles from "./WaveTracker.module.scss";

type WaveTrackerProps = {
  game: GameState;
};

/** Bottom-left tracker for rail mode: which wave this is, and a tick per wave cleared. */
export function WaveTracker({ game }: WaveTrackerProps) {
  const current = Math.min(game.wave + 1, game.waveCount);
  return (
    <div className={styles.tracker} aria-label={`wave ${current} of ${game.waveCount}`}>
      <span className={styles.tracker__label}>wave</span>
      <span className={styles.tracker__value}>
        {String(current).padStart(2, "0")}
        <span className={styles.tracker__of}>/ {String(game.waveCount).padStart(2, "0")}</span>
      </span>
      <span className={styles.tracker__ticks} aria-hidden="true">
        {Array.from({ length: game.waveCount }, (_, i) => (
          <span
            key={i}
            className={cx(
              styles.tracker__tick,
              i < game.wave && styles["tracker__tick--done"],
              i === game.wave && game.phase === "wave" && styles["tracker__tick--live"],
            )}
          />
        ))}
      </span>
    </div>
  );
}
