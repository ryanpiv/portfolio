"use client";

import type { ReactNode } from "react";

import { LabSettingsMenu, SettingsSection } from "@components/LabSettings";
import { PillNav } from "@components/PillGroup";
import {
  ARCADE_RAIL_ID,
  ARCADE_ROAM_ID,
  railMeta,
  roamMeta,
  type EffectSettings,
  type LabTheme,
  type QualityId,
} from "@data/lab";
import { cx } from "@utils/cx";
import { buildLabUrl, defaultLabQuery } from "@utils/labUrl";
import type { ProgressStore } from "@utils/progressStore";

import { AchievementsList, AchievementToast } from "./progress";
import styles from "./ArcadeHud.module.scss";

export type GameMode = "rail" | "roam";

export type ReadoutEntry = { label: string; value: string };

type ArcadeHudProps = {
  theme: LabTheme;
  onThemeChange: (theme: LabTheme) => void;
  quality: QualityId;
  onQualityChange: (quality: QualityId) => void;
  effects: EffectSettings;
  onEffectsChange: (patch: Partial<EffectSettings>) => void;
  mode: GameMode;
  progress: ProgressStore;
  /** Top centre: the shield / hull bar. */
  gauge: ReactNode;
  /** Bottom left: radar, wave tracker — whatever tells you where you are. */
  tracker?: ReactNode;
  /** Bottom right, above the numbers: the thing in your hands. */
  weapon?: ReactNode;
  /** Bottom right: one or two numbers that matter right now. */
  readout: ReadonlyArray<ReadoutEntry>;
  /** Bottom centre: controls hint. Fades out after a few seconds. */
  hint: string;
  /** Centre overlays: callouts, mission screens, respawn notices. */
  center?: ReactNode;
  /** Leva host; the settings menu owns its visibility. */
  controls?: (hidden: boolean) => ReactNode;
};

const MODES: ReadonlyArray<{ mode: GameMode; variantId: string; label: string }> = [
  { mode: "rail", variantId: ARCADE_RAIL_ID, label: "rail" },
  { mode: "roam", variantId: ARCADE_ROAM_ID, label: "free roam" },
];

const META: Record<GameMode, { title: string }> = { rail: railMeta, roam: roamMeta };

/**
 * Game HUD shared by both modes, kept to what a player glances at: vitals
 * top centre, tracker bottom left, weapon and a number or two bottom right,
 * callouts in the middle. Everything else lives behind the gear. Pointer
 * events pass through to the canvas except on the menu.
 */
export function ArcadeHud({
  theme,
  onThemeChange,
  quality,
  onQualityChange,
  effects,
  onEffectsChange,
  mode,
  progress,
  gauge,
  tracker,
  weapon,
  readout,
  hint,
  center,
  controls,
}: ArcadeHudProps) {
  const modeItems = MODES.map((entry) => ({
    href: buildLabUrl(entry.variantId, { ...defaultLabQuery, theme, quality }),
    label: entry.label,
    active: entry.mode === mode,
  }));

  return (
    <div className={cx(styles.hud, styles[`hud--${theme}`])} data-theme={theme}>
      <header className={styles.hud__top}>
        <p className={styles.hud__mode}>{META[mode].title}</p>
        <div className={styles.hud__gauge}>{gauge}</div>
        <LabSettingsMenu
          theme={theme}
          onThemeChange={onThemeChange}
          quality={quality}
          onQualityChange={onQualityChange}
          effects={effects}
          onEffectsChange={onEffectsChange}
          scope={mode}
          tuning={controls}
        >
          <SettingsSection title="Mode">
            <PillNav label="Mode" items={modeItems} />
          </SettingsSection>
          <SettingsSection title="Achievements">
            <AchievementsList store={progress} />
          </SettingsSection>
        </LabSettingsMenu>
      </header>

      <div className={styles.hud__center}>
        <AchievementToast store={progress} />
        {center}
      </div>

      <footer className={styles.hud__bottom}>
        <div className={styles.hud__tracker}>{tracker}</div>
        <p key={hint} className={styles.hud__hint}>
          {hint}
        </p>
        <div className={styles.hud__stats}>
          {weapon}
          <dl className={styles.readout}>
            {readout.map((entry) => (
              <div key={entry.label} className={styles.readout__entry}>
                <dt className={styles.readout__label}>{entry.label}</dt>
                <dd className={styles.readout__value}>{entry.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </footer>
    </div>
  );
}
