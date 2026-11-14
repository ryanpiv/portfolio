"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { TuningPanel } from "@components/LabScene";
import { LabStage, SceneLoading } from "@components/LabStage";
import { ARCADE_RAIL_ID, qualityPresets, railConfig, railWaves, type LabTheme, type QualityId } from "@data/lab";
import { useLabViewState } from "@hooks/useLabViewState";
import { useStore } from "@hooks/useStore";

import { useInput } from "./hooks/useInput";
import { useProgress } from "./progress";
import { createGameStore, initialGameState, type GamePhase, type GameRules } from "./rail/gameStore";
import { MissionScreen } from "./rail/MissionScreen";
import { WaveCallout } from "./rail/WaveCallout";
import { WaveTracker } from "./rail/WaveTracker";
import { ShieldBar } from "./ShieldBar";
import { ArcadeHud } from "./ArcadeHud";

const RailScene = dynamic(() => import("./rail/RailScene"), {
  ssr: false,
  loading: () => <SceneLoading>spooling up the ship…</SceneLoading>,
});

const RULES: GameRules = { waves: railWaves, shieldMax: railConfig.combat.shieldMax };

const STEER_HINT = { keys: "WASD / arrows to steer", touch: "hold to steer toward your finger" } as const;

const PHASE_HINT: Record<GamePhase, { keys: string; touch: string }> = {
  briefing: { keys: "incoming — hold fire until they close", touch: "incoming — they fire first" },
  wave: {
    keys: "space / J or hold the pointer to fire · double-tap A/D (or Q/E) to barrel roll",
    touch: "holding also fires",
  },
  complete: { keys: "all waves cleared", touch: "all waves cleared" },
  failed: { keys: "shield depleted", touch: "shield depleted" },
};

type ArcadeProps = {
  initialTheme?: LabTheme;
  initialQuality?: QualityId;
};

/** Full-viewport rail shooter for `/lab/arcade`. Owns input, theme, and the game store; the scene is client-only. */
export function ArcadeRail({ initialTheme, initialQuality }: ArcadeProps) {
  const { theme, setTheme, quality, setQuality, degradeQuality, effects, patchEffects, capability } = useLabViewState({
    variantId: ARCADE_RAIL_ID,
    initialTheme,
    initialQuality,
  });
  const { input, bind } = useInput();
  const progress = useProgress();
  const [store] = useState(() => createGameStore(RULES));
  const [runId, setRunId] = useState(0);
  const game = useStore(store);
  const scheme = capability?.touchOnly ? "touch" : "keys";

  const retry = () => {
    store.set(initialGameState(RULES));
    setRunId((id) => id + 1);
  };

  return (
    <LabStage
      theme={theme}
      capability={capability}
      scene={
        <RailScene
          quality={qualityPresets[quality]}
          onDegrade={degradeQuality}
          theme={theme}
          inputRef={input}
          store={store}
          progress={progress}
          runId={runId}
        />
      }
      {...bind}
    >
      <ArcadeHud
        theme={theme}
        onThemeChange={setTheme}
        quality={quality}
        onQualityChange={setQuality}
        effects={effects}
        onEffectsChange={patchEffects}
        mode="rail"
        progress={progress}
        gauge={<ShieldBar shield={game.shield} shieldMax={game.shieldMax} />}
        tracker={<WaveTracker game={game} />}
        readout={[{ label: "hits", value: `${game.hits} / ${game.total}` }]}
        hint={`${STEER_HINT[scheme]} · ${PHASE_HINT[game.phase][scheme]}`}
        center={
          <>
            <WaveCallout game={game} />
            <MissionScreen game={game} onRetry={retry} />
          </>
        }
        controls={(hidden) => <TuningPanel hidden={hidden} />}
      />
    </LabStage>
  );
}
