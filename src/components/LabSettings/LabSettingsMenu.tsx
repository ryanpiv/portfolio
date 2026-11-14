"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { PillGroup, type PillOption } from "@components/PillGroup";
import {
  effectTogglesFor,
  type LabScope,
  FOLIAGE_DENSITIES,
  LAB_THEMES,
  QUALITY_ORDER,
  qualityPresets,
  type EffectSettings,
  type FoliageDensity,
  type LabTheme,
  type QualityId,
} from "@data/lab";
import { cx } from "@utils/cx";

import styles from "./LabSettingsMenu.module.scss";
import { SettingsSection, SettingsToggle } from "./SettingsControls";

type LabSettingsMenuProps = {
  theme: LabTheme;
  onThemeChange: (theme: LabTheme) => void;
  quality: QualityId;
  onQualityChange: (quality: QualityId) => void;
  effects: EffectSettings;
  onEffectsChange: (patch: Partial<EffectSettings>) => void;
  /** Which scene this menu serves; only its effects are listed (foliage is roam-only). */
  scope: LabScope;
  /** Extra sections the page adds (mode nav, view switches, achievements). */
  children?: ReactNode;
  /** Leva host. Stays mounted; shown under the gear while "tuning" is on. */
  tuning?: (hidden: boolean) => ReactNode;
};

const THEME_OPTIONS: PillOption<LabTheme>[] = LAB_THEMES.map((theme) => ({ value: theme, label: theme }));
const QUALITY_OPTIONS: PillOption<QualityId>[] = QUALITY_ORDER.map((id) => ({ value: id, label: qualityPresets[id].label }));
const FOLIAGE_OPTIONS: PillOption<FoliageDensity>[] = FOLIAGE_DENSITIES.map((d) => ({ value: d, label: d }));

/**
 * The one place a visitor changes anything about a lab scene: a gear in
 * the top-right corner opens a panel with display, effects, and whatever
 * sections the page adds. Everything in it is remembered between visits.
 */
export function LabSettingsMenu({
  theme,
  onThemeChange,
  quality,
  onQualityChange,
  effects,
  onEffectsChange,
  scope,
  children,
  tuning,
}: LabSettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const [tuningOn, setTuningOn] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);

  // Escape or a click outside closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={root} className={styles.menu}>
      <button
        type="button"
        className={cx(styles.menu__gear, open && styles["menu__gear--open"])}
        aria-label="Settings"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <GearIcon />
      </button>

      {open && (
        <div id={panelId} role="dialog" aria-label="Settings" className={styles.menu__panel}>
          <SettingsSection title="Display">
            <PillGroup label="Theme" options={THEME_OPTIONS} value={theme} onChange={onThemeChange} />
            <PillGroup label="Quality" options={QUALITY_OPTIONS} value={quality} onChange={onQualityChange} />
          </SettingsSection>

          <SettingsSection title="Effects">
            {effectTogglesFor(scope).map(({ key, label, hint }) => (
              <SettingsToggle
                key={key}
                label={label}
                hint={hint}
                checked={effects[key]}
                onChange={(checked) => onEffectsChange({ [key]: checked })}
              />
            ))}
            {scope === "roam" && (
              <PillGroup
                label="Foliage"
                options={FOLIAGE_OPTIONS}
                value={effects.foliage}
                onChange={(foliage) => onEffectsChange({ foliage })}
              />
            )}
          </SettingsSection>

          {children}

          {tuning && (
            <SettingsSection title="Developer">
              <SettingsToggle label="Tuning panel" hint="live sliders for every preset" checked={tuningOn} onChange={setTuningOn} />
            </SettingsSection>
          )}
        </div>
      )}

      {tuning && <div className={cx(styles.menu__tuning, !tuningOn && styles["menu__tuning--hidden"])}>{tuning(!tuningOn)}</div>}
    </div>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" />
    </svg>
  );
}
