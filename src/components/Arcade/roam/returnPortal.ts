/**
 * Remembers which portal took the visitor to a project so that coming back
 * (browser back, the Lab link) puts the ship at that ring instead of the
 * spawn. Session-scoped: a fresh tab starts at the spawn.
 */

export const RETURN_PORTAL_KEY = "lab.arcade.roam.returnPortal";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function safeStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function rememberReturnPortal(slug: string, storage: StorageLike | null = safeStorage()): void {
  try {
    storage?.setItem(RETURN_PORTAL_KEY, slug);
  } catch {
    // Storage full or disabled: the visitor just starts at the spawn.
  }
}

/** Reads and clears the remembered portal, if any. */
export function consumeReturnPortal(storage: StorageLike | null = safeStorage()): string | null {
  try {
    const slug = storage?.getItem(RETURN_PORTAL_KEY) ?? null;
    if (slug) storage?.removeItem(RETURN_PORTAL_KEY);
    return slug;
  } catch {
    return null;
  }
}
