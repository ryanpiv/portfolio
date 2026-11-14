"use client";

import { useCallback, useSyncExternalStore } from "react";

import { defaultLabSettings, parseLabSettings, type EffectSettings, type LabSettings } from "@data/lab";
import { createStore } from "@utils/createStore";
import { hydrateStore } from "@utils/persistedStore";

export const SETTINGS_STORAGE_KEY = "lab.settings";

/** One settings store for the whole tab; hydrated from storage on first client read. */
const settingsStore = createStore<LabSettings>(defaultLabSettings);
let hydrated = false;

function getSnapshot(): LabSettings {
  if (!hydrated) {
    hydrated = true;
    hydrateStore(settingsStore, { key: SETTINGS_STORAGE_KEY, parse: parseLabSettings });
  }
  return settingsStore.get();
}

const getServerSnapshot = (): LabSettings => defaultLabSettings;

/**
 * The visitor's remembered lab settings. SSR and hydration see the
 * defaults; the stored values take over right after, and every change is
 * written back to `localStorage`.
 */
export function useLabSettings() {
  const settings = useSyncExternalStore(settingsStore.subscribe, getSnapshot, getServerSnapshot);

  const patch = useCallback((next: Partial<LabSettings>) => settingsStore.set(next), []);
  const patchEffects = useCallback(
    (next: Partial<EffectSettings>) => settingsStore.set((state) => ({ effects: { ...state.effects, ...next } })),
    [],
  );

  return { settings, patch, patchEffects };
}

/** Test seam: forget the stored state and re-read it on the next render. */
export function resetLabSettingsForTests(): void {
  hydrated = false;
  settingsStore.set(defaultLabSettings);
}
