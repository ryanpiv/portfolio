import type { ProgressStatKey } from "@data/lab";

import { createStore, type Store } from "./createStore";
import { addStat, emptyProgress, exploreProject, parseProgress, type ProgressState } from "./progress";

/**
 * One progression store for every arcade mode, mirrored to localStorage.
 * Create it once per app (see `components/Arcade/progress`), call
 * `hydrateProgress` after mount, and record events through the helpers so
 * achievements unlock in one place.
 */

export const PROGRESS_STORAGE_KEY = "lab.arcade.progress";
/** Key used before the lab was renamed; read once so saves carry over. */
const LEGACY_STORAGE_KEY = "lab.starfox.progress";

export type ProgressStore = Store<ProgressState>;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function safeStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null; // privacy mode / disabled storage
  }
}

export function createProgressStore(): ProgressStore {
  return createStore<ProgressState>(emptyProgress);
}

/** Loads saved progress into the store and starts mirroring changes back. Returns an unsubscribe. */
export function hydrateProgress(store: ProgressStore, storage: StorageLike | null = safeStorage()): () => void {
  if (!storage) return () => {};
  try {
    const raw = storage.getItem(PROGRESS_STORAGE_KEY) ?? storage.getItem(LEGACY_STORAGE_KEY);
    if (raw) store.set(parseProgress(JSON.parse(raw)));
  } catch {
    // Unreadable save: start fresh rather than crash the lab.
  }
  return store.subscribe(() => {
    try {
      storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(store.get()));
    } catch {
      // Quota or disabled storage: progress lives in memory for this visit.
    }
  });
}

export function recordStat(
  store: ProgressStore,
  key: Exclude<ProgressStatKey, "projectsExplored">,
  amount = 1,
): void {
  store.set((state) => addStat(state, key, amount));
}

export function recordExplored(store: ProgressStore, slug: string): void {
  store.set((state) => exploreProject(state, slug));
}
