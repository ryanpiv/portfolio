"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { TuningPanel } from "@components/LabScene";
import { STARFOX_ID, starFoxConfig, starFoxWaves, type LabTheme } from "@data/lab";
import { useLabViewState } from "@hooks/useLabViewState";
import { useStore } from "@hooks/useStore";
import { cx } from "@utils/cx";

import { useInput } from "./hooks/useInput";
import { useProgress } from "./progress";
import { createGameStore, initialGameState, type GamePhase, type GameRules } from "./rail/gameStore";
import { MissionScreen } from "./rail/MissionScreen";
import { WaveCallout } from "./rail/WaveCallout";
import { ShieldBar } from "./ShieldBar";
import styles from "./StarFox.module.scss";
import { StarFoxHud } from "./StarFoxHud";

const RailScene = dynamic(() => import("./rail/RailScene"), {
  ssr: false,
  loading: () => <p className={styles.starFox__loading}>spooling up the Arwing…</p>,
});

const RULES: GameRules = { waves: starFoxWaves, shieldMax: starFoxConfig.combat.shieldMax };

const PHASE_HINT: Record<GamePhase, string> = {
  briefing: "incoming — hold fire until they close",
  wave: "space / J or hold the pointer to fire · double-tap A/D (or Q/E) to barrel roll",
  complete: "all waves cleared",
  failed: "shield depleted",
};

type StarFoxProps = {
  initialTheme?: LabTheme;
};

/** Full-viewport rail shooter for `/lab/starfox`. Owns input, theme, and the game store; the scene is client-only. */
export function StarFox({ initialTheme }: StarFoxProps) {
  const { theme, setTheme } = useLabViewState({ variantId: STARFOX_ID, initialTheme });
  const { input, bind } = useInput();
  const progress = useProgress();
  const [store] = useState(() => createGameStore(RULES));
  const [runId, setRunId] = useState(0);
  const game = useStore(store);

  const retry = () => {
    store.set(initialGameState(RULES));
    setRunId((id) => id + 1);
  };

  return (
    <div className={cx(styles.starFox, styles[`starFox--${theme}`])} {...bind}>
      <div className={styles.starFox__canvas}>
        <RailScene theme={theme} inputRef={input} store={store} progress={progress} runId={runId} />
      </div>
      <StarFoxHud
        theme={theme}
        onThemeChange={setTheme}
        mode="rail"
        progress={progress}
        readout={[
          { label: "wave", value: `${Math.min(game.wave + 1, game.waveCount)} / ${game.waveCount}` },
          { label: "hits", value: `${game.hits} / ${game.total}` },
          { label: "escaped", value: String(game.escaped) },
        ]}
        gauge={<ShieldBar shield={game.shield} shieldMax={game.shieldMax} />}
        hint={`WASD / arrows to steer · ${PHASE_HINT[game.phase]}`}
        center={
          <>
            <WaveCallout game={game} />
            <MissionScreen game={game} onRetry={retry} />
          </>
        }
        controls={<TuningPanel />}
      />
    </div>
  );
}
