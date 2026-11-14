import type { ProgressStatKey } from "@data/lab";

import { createStore, type Store } from "./createStore";
import { hydrateStore } from "./persistedStore";
import { addStat, emptyProgress, exploreProject, parseProgress, type ProgressState } from "./progress";
import { safeStorage, type StorageLike } from "./storage";

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

export function createProgressStore(): ProgressStore {
  return createStore<ProgressState>(emptyProgress);
}

/** Loads saved progress into the store and starts mirroring changes back. Returns an unsubscribe. */
export function hydrateProgress(store: ProgressStore, storage: StorageLike | null = safeStorage()): () => void {
  return hydrateStore(store, { key: PROGRESS_STORAGE_KEY, legacyKeys: [LEGACY_STORAGE_KEY], parse: parseProgress, storage });
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
