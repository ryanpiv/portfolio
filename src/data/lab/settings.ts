import { isQualityId, type QualityId } from "./quality";
import type { LabTheme } from "./types";
import { isLabTheme } from "./view";

/**
 * Everything a visitor can set from the lab's settings menu, remembered in
 * the browser between visits. Theme and quality are overrides: absent means
 * "whatever the system / device suggests". Effects are plain toggles that
 * every lab scene reads; a quality tier without post-processing still turns
 * bloom and flare off regardless.
 */

export type FoliageDensity = "off" | "sparse" | "dense";

export type EffectSettings = {
  /** Bloom on bright surfaces. */
  bloom: boolean;
  /** Lens flare on the key light. */
  flare: boolean;
  /** Ship headlight plus muzzle and explosion flashes (real point lights). */
  dynamicLights: boolean;
  /** Procedurally lit windows on the towers. */
  windows: boolean;
  /** Trees and parks in the arena. */
  foliage: FoliageDensity;
  /** Soft glow and trails on bolts, shockwaves and smoke on explosions. */
  trails: boolean;
};

export type LabSettings = {
  theme?: LabTheme;
  quality?: QualityId;
  effects: EffectSettings;
};

export const FOLIAGE_DENSITIES: readonly FoliageDensity[] = ["off", "sparse", "dense"];

export const defaultEffects: EffectSettings = {
  bloom: true,
  flare: true,
  dynamicLights: true,
  windows: true,
  foliage: "dense",
  trails: true,
};

export const defaultLabSettings: LabSettings = { effects: defaultEffects };

/** Which lab scene a settings menu is serving; decides which effects it lists. */
export type LabScope = "field" | "rail" | "roam";

export type EffectToggle = {
  key: keyof Omit<EffectSettings, "foliage">;
  label: string;
  hint: string;
  scopes: readonly LabScope[];
};

const EVERYWHERE: readonly LabScope[] = ["field", "rail", "roam"];
const ARCADE: readonly LabScope[] = ["rail", "roam"];

/** Boolean effect toggles, in menu order, with the scenes they apply to. */
const EFFECT_TOGGLES: readonly EffectToggle[] = [
  { key: "bloom", label: "Bloom", hint: "glow on bright surfaces", scopes: EVERYWHERE },
  { key: "flare", label: "Lens flare", hint: "streaks off the key light", scopes: EVERYWHERE },
  { key: "dynamicLights", label: "Dynamic lights", hint: "headlight, muzzle and blast flashes", scopes: ARCADE },
  { key: "windows", label: "Lit windows", hint: "towers glow from inside", scopes: ["roam"] },
  { key: "trails", label: "Trails & shockwaves", hint: "bolt glow, blast rings, smoke", scopes: ARCADE },
];

export const effectTogglesFor = (scope: LabScope): EffectToggle[] =>
  EFFECT_TOGGLES.filter((toggle) => toggle.scopes.includes(scope));

function isFoliageDensity(value: unknown): value is FoliageDensity {
  return (FOLIAGE_DENSITIES as readonly unknown[]).includes(value);
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/** Rebuild settings from whatever was stored, dropping anything unknown or malformed. */
export function parseLabSettings(raw: unknown): LabSettings {
  if (!raw || typeof raw !== "object") return defaultLabSettings;
  const input = raw as Record<string, unknown>;
  const effects = (input.effects && typeof input.effects === "object" ? input.effects : {}) as Record<string, unknown>;
  return {
    theme: isLabTheme(input.theme) ? input.theme : undefined,
    quality: isQualityId(input.quality) ? input.quality : undefined,
    effects: {
      bloom: bool(effects.bloom, defaultEffects.bloom),
      flare: bool(effects.flare, defaultEffects.flare),
      dynamicLights: bool(effects.dynamicLights, defaultEffects.dynamicLights),
      windows: bool(effects.windows, defaultEffects.windows),
      foliage: isFoliageDensity(effects.foliage) ? effects.foliage : defaultEffects.foliage,
      trails: bool(effects.trails, defaultEffects.trails),
    },
  };
}
