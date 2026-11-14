"use client";

import type { ReactNode } from "react";

import { LabHud, LabHudCard, LabHudHint } from "@components/LabHud";
import { PillGroup, PillNav, type PillOption } from "@components/PillGroup";
import { STARFOX_ID, STARFOX_ROAM_ID, starFoxMeta, starFoxRoamMeta, type LabTheme } from "@data/lab";
import { buildLabUrl, defaultLabQuery } from "@utils/labUrl";
import type { ProgressStore } from "@utils/progressStore";

import { AchievementsPanel, AchievementToast } from "./progress";
import styles from "./StarFoxHud.module.scss";

export type GameMode = "rail" | "roam";

export type ReadoutEntry = { label: string; value: string };

type StarFoxHudProps = {
  theme: LabTheme;
  onThemeChange: (theme: LabTheme) => void;
  mode: GameMode;
  progress: ProgressStore;
  /** Mode-specific label/value pairs for the footer card. */
  readout: ReadonlyArray<ReadoutEntry>;
  /** Mode-specific controls hint under the readout. */
  hint: string;
  /** Extra footer content between the readout and the hint (e.g. the shield bar). */
  gauge?: ReactNode;
  /** Mode-specific overlays (callouts, mission screens, radar). */
  center?: ReactNode;
  controls?: ReactNode;
};

const THEME_OPTIONS: PillOption<LabTheme>[] = [
  { value: "dark", label: "dark" },
  { value: "light", label: "light" },
];

const MODES: ReadonlyArray<{ mode: GameMode; variantId: string; label: string }> = [
  { mode: "rail", variantId: STARFOX_ID, label: "rail" },
  { mode: "roam", variantId: STARFOX_ROAM_ID, label: "free roam" },
];

const META: Record<GameMode, { title: string; tagline: string }> = {
  rail: starFoxMeta,
  roam: starFoxRoamMeta,
};

/** HUD chrome shared by both game modes: theme + mode switches, readout, achievements. */
export function StarFoxHud({
  theme,
  onThemeChange,
  mode,
  progress,
  readout,
  hint,
  gauge,
  center,
  controls,
}: StarFoxHudProps) {
  const modeItems = MODES.map((entry) => ({
    href: buildLabUrl(entry.variantId, { ...defaultLabQuery, theme }),
    label: entry.label,
    active: entry.mode === mode,
  }));

  return (
    <LabHud
      theme={theme}
      eyebrow="Lab · star fox"
      title={META[mode].title}
      tagline={META[mode].tagline}
      switches={
        <>
          <PillGroup label="Theme" options={THEME_OPTIONS} value={theme} onChange={onThemeChange} />
          <PillNav label="Mode" items={modeItems} />
        </>
      }
      controls={controls}
      center={
        <>
          <AchievementToast store={progress} />
          {center}
        </>
      }
      footer={
        <>
          <LabHudCard live>
            <dl className={styles.readout}>
              {readout.map((entry) => (
                <Readout key={entry.label} {...entry} />
              ))}
            </dl>
            {gauge}
            <LabHudHint>{hint}</LabHudHint>
          </LabHudCard>
          <AchievementsPanel store={progress} />
        </>
      }
    />
  );
}

function Readout({ label, value }: ReadoutEntry) {
  return (
    <div>
      <dt className={styles.readout__label}>{label}</dt>
      <dd className={styles.readout__value}>{value}</dd>
    </div>
  );
}
