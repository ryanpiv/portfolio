/** `localStorage` access that never throws: null in SSR, privacy mode, or with storage disabled. */

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function safeStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readStored(key: string, storage: StorageLike | null = safeStorage()): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string | null, storage: StorageLike | null = safeStorage()): void {
  try {
    if (value === null) storage?.removeItem(key);
    else storage?.setItem(key, value);
  } catch {
    // Quota or privacy mode: the choice just will not persist.
  }
}
