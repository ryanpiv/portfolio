import type { Store } from "./createStore";
import { readStored, safeStorage, writeStored, type StorageLike } from "./storage";

type HydrateOptions<T> = {
  /** Where the state is written. */
  key: string;
  /** Older keys read as fallbacks (renames); never written. */
  legacyKeys?: string[];
  /** Rebuilds a valid state from whatever was stored, so a stale or hand-edited entry can never crash the page. */
  parse: (raw: unknown) => T;
  storage?: StorageLike | null;
};

/**
 * Mirrors a `createStore` store to `localStorage` as JSON. Call once on the
 * client (after SSR, so markup matches): loads the saved state, then writes
 * every change back. Returns the unsubscribe.
 */
export function hydrateStore<T extends object>(
  store: Store<T>,
  { key, legacyKeys = [], parse, storage = safeStorage() }: HydrateOptions<T>,
): () => void {
  if (!storage) return () => {};
  const raw = [key, ...legacyKeys].map((k) => readStored(k, storage)).find((value) => value !== null);
  if (raw) {
    try {
      store.set(parse(JSON.parse(raw)));
    } catch {
      // Unreadable entry: keep the defaults.
    }
  }
  return store.subscribe(() => writeStored(key, JSON.stringify(store.get()), storage));
}
