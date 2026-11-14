"use client";

import { useState, type ReactNode } from "react";

import { QualitySwitch, ThemeSwitch } from "@components/LabSwitches";
import { PillNav } from "@components/PillGroup";
import { ARCADE_RAIL_ID, ARCADE_ROAM_ID, railMeta, roamMeta, type LabTheme, type QualityId } from "@data/lab";
import { cx } from "@utils/cx";
import { buildLabUrl, defaultLabQuery } from "@utils/labUrl";
import type { ProgressStore } from "@utils/progressStore";

import { AchievementsPanel, AchievementToast } from "./progress";
import styles from "./ArcadeHud.module.scss";

export type GameMode = "rail" | "roam";

export type ReadoutEntry = { label: string; value: string };

type ArcadeHudProps = {
  theme: LabTheme;
  onThemeChange: (theme: LabTheme) => void;
  quality: QualityId;
  onQualityChange: (quality: QualityId) => void;
  mode: GameMode;
  progress: ProgressStore;
  /** Top centre: the shield / hull bar. */
  gauge: ReactNode;
  /** Bottom left: radar, wave tracker — whatever tells you where you are. */
  tracker?: ReactNode;
  /** Bottom right, above the stats: the thing in your hands. */
  weapon?: ReactNode;
  /** Bottom right: mode-specific counters. */
  readout: ReadonlyArray<ReadoutEntry>;
  /** Bottom centre: controls hint. Fades after a few seconds. */
  hint: string;
  /** Centre overlays: callouts, mission screens, respawn notices. */
  center?: ReactNode;
  /** Tuning panel; stays mounted (Leva needs a host) but is only shown when toggled on. */
  controls?: (hidden: boolean) => ReactNode;
};

const MODES: ReadonlyArray<{ mode: GameMode; variantId: string; label: string }> = [
  { mode: "rail", variantId: ARCADE_RAIL_ID, label: "rail" },
  { mode: "roam", variantId: ARCADE_ROAM_ID, label: "free roam" },
];

const META: Record<GameMode, { title: string }> = { rail: railMeta, roam: roamMeta };

/**
 * Game HUD shared by both modes, laid out the way shooters do it: the
 * vitals bar top centre, the tracker bottom left, the weapon and counters
 * bottom right, callouts in the middle. No cards — thin lines and type on
 * the scene, with corner brackets framing the view. Pointer events pass
 * through to the canvas except on the switches.
 */
export function ArcadeHud({
  theme,
  onThemeChange,
  quality,
  onQualityChange,
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
  const [tuning, setTuning] = useState(false);
  const modeItems = MODES.map((entry) => ({
    href: buildLabUrl(entry.variantId, { ...defaultLabQuery, theme, quality }),
    label: entry.label,
    active: entry.mode === mode,
  }));

  return (
    <div className={cx(styles.hud, styles[`hud--${theme}`])} data-theme={theme}>
      <span className={cx(styles.hud__bracket, styles["hud__bracket--tl"])} aria-hidden="true" />
      <span className={cx(styles.hud__bracket, styles["hud__bracket--tr"])} aria-hidden="true" />
      <span className={cx(styles.hud__bracket, styles["hud__bracket--bl"])} aria-hidden="true" />
      <span className={cx(styles.hud__bracket, styles["hud__bracket--br"])} aria-hidden="true" />

      <header className={styles.hud__top}>
        <div className={styles.hud__ident}>
          <p className={styles.hud__eyebrow}>Lab · arcade</p>
          <h1 className={styles.hud__title}>{META[mode].title}</h1>
          <PillNav label="Mode" items={modeItems} />
        </div>
        <div className={styles.hud__gauge}>{gauge}</div>
        <div className={styles.hud__switches}>
          <ThemeSwitch value={theme} onChange={onThemeChange} />
          <QualitySwitch value={quality} onChange={onQualityChange} />
          {controls && (
            <button
              type="button"
              className={cx(styles.hud__tuningToggle, tuning && styles["hud__tuningToggle--on"])}
              aria-pressed={tuning}
              onClick={() => setTuning((on) => !on)}
            >
              tuning
            </button>
          )}
          {controls && (
            <div className={cx(styles.hud__controls, !tuning && styles["hud__controls--hidden"])}>{controls(!tuning)}</div>
          )}
        </div>
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
          {weapon && <div className={styles.hud__weapon}>{weapon}</div>}
          <dl className={styles.readout}>
            {readout.map((entry) => (
              <Readout key={entry.label} {...entry} />
            ))}
          </dl>
          <AchievementsPanel store={progress} />
        </div>
      </footer>
    </div>
  );
}

function Readout({ label, value }: ReadoutEntry) {
  return (
    <div className={styles.readout__entry}>
      <dt className={styles.readout__label}>{label}</dt>
      <dd className={styles.readout__value}>{value}</dd>
    </div>
  );
}
