"use client";

import type { ReactNode } from "react";

import { LabHud, LabHudCard, LabHudHint } from "@components/LabHud";
import { PillGroup, type PillOption } from "@components/PillGroup";
import { starFoxMeta, type LabTheme } from "@data/lab";
import { useStore } from "@hooks/useStore";

import type { GamePhase, GameStore } from "./game/gameStore";
import styles from "./StarFoxHud.module.scss";

type StarFoxHudProps = {
  theme: LabTheme;
  onThemeChange: (theme: LabTheme) => void;
  store: GameStore;
  controls?: ReactNode;
};

const THEME_OPTIONS: PillOption<LabTheme>[] = [
  { value: "dark", label: "dark" },
  { value: "light", label: "light" },
];

const PHASE_HINT: Record<GamePhase, string> = {
  briefing: "incoming — hold fire until they close",
  wave: "space / J or hold the pointer to fire",
  complete: "all waves cleared",
};

export function StarFoxHud({ theme, onThemeChange, store, controls }: StarFoxHudProps) {
  const game = useStore(store);

  return (
    <LabHud
      theme={theme}
      eyebrow="Lab · star fox"
      title={starFoxMeta.title}
      tagline={starFoxMeta.tagline}
      switches={<PillGroup label="Theme" options={THEME_OPTIONS} value={theme} onChange={onThemeChange} />}
      controls={controls}
      footer={
        <LabHudCard live>
          <dl className={styles.readout}>
            <Readout label="wave" value={`${Math.min(game.wave + 1, game.waveCount)} / ${game.waveCount}`} />
            <Readout label="hits" value={`${game.hits} / ${game.total}`} />
            <Readout label="escaped" value={String(game.escaped)} />
          </dl>
          <LabHudHint>WASD / arrows to steer · {PHASE_HINT[game.phase]}</LabHudHint>
        </LabHudCard>
      }
    />
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={styles.readout__label}>{label}</dt>
      <dd className={styles.readout__value}>{value}</dd>
    </div>
  );
}
