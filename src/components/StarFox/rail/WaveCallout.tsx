"use client";

import { useEffect, useState } from "react";

import { starFoxWaves } from "@data/lab";

import type { GameState } from "./gameStore";
import styles from "./WaveCallout.module.scss";

type WaveCalloutProps = {
  game: Pick<GameState, "phase" | "wave">;
};

/** How long the callout stays up after a wave spawns. */
export const CALLOUT_MS = 1800;

/** "Wave 2 · 4 fighters" flashed in the middle of the screen when a wave arrives. */
export function WaveCallout({ game }: WaveCalloutProps) {
  // The wave whose callout has already timed out; a new wave index shows again automatically.
  const [expired, setExpired] = useState<number | null>(null);
  const active = game.phase === "wave" ? game.wave : null;

  useEffect(() => {
    if (active === null) return;
    const timer = setTimeout(() => setExpired(active), CALLOUT_MS);
    return () => clearTimeout(timer);
  }, [active]);

  const shown = active !== null && expired !== active ? active : null;
  if (shown === null) return null;
  const spec = starFoxWaves[shown];
  const count = spec?.count ?? 0;

  return (
    <p className={styles.waveCallout} role="status">
      <span className={styles.waveCallout__wave}>wave {shown + 1}</span>
      <span className={styles.waveCallout__count}>
        {count} {count === 1 ? "fighter" : "fighters"} · {spec?.formation}
      </span>
    </p>
  );
}
