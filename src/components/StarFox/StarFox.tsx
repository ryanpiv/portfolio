"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { TuningPanel } from "@components/LabScene";
import { STARFOX_ID, starFoxConfig, starFoxWaves, type LabTheme } from "@data/lab";
import { useLabViewState } from "@hooks/useLabViewState";
import { cx } from "@utils/cx";

import { createGameStore, initialGameState, type GameRules } from "./game/gameStore";
import { useInput } from "./hooks/useInput";
import styles from "./StarFox.module.scss";
import { StarFoxHud } from "./StarFoxHud";

const StarFoxScene = dynamic(() => import("./StarFoxScene"), {
  ssr: false,
  loading: () => <p className={styles.starFox__loading}>spooling up the Arwing…</p>,
});

const RULES: GameRules = { waves: starFoxWaves, shieldMax: starFoxConfig.combat.shieldMax };

type StarFoxProps = {
  initialTheme?: LabTheme;
};

/** Full-viewport rail shooter for `/lab/starfox`. Owns input, theme, and the game store; the scene is client-only. */
export function StarFox({ initialTheme }: StarFoxProps) {
  const { theme, setTheme } = useLabViewState({ variantId: STARFOX_ID, initialTheme });
  const { input, bind } = useInput();
  const [store] = useState(() => createGameStore(RULES));
  const [runId, setRunId] = useState(0);

  const retry = () => {
    store.set(initialGameState(RULES));
    setRunId((id) => id + 1);
  };

  return (
    <div className={cx(styles.starFox, styles[`starFox--${theme}`])} {...bind}>
      <div className={styles.starFox__canvas}>
        <StarFoxScene theme={theme} input={input} store={store} runId={runId} />
      </div>
      <StarFoxHud theme={theme} onThemeChange={setTheme} store={store} onRetry={retry} controls={<TuningPanel />} />
    </div>
  );
}
