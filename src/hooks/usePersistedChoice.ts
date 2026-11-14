"use client";

import { useCallback, useSyncExternalStore } from "react";

import { readStored, writeStored } from "@utils/storage";

type Listener = () => void;

/** In-tab listeners per key; cross-tab changes arrive through the `storage` event. */
const listeners = new Map<string, Set<Listener>>();
/** Latest value set in this tab, so the choice still works when storage is unavailable. */
const memory = new Map<string, string | null>();

function subscribeKey(key: string, listener: Listener): () => void {
  const set = listeners.get(key) ?? new Set<Listener>();
  set.add(listener);
  listeners.set(key, set);
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    set.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function notify(key: string): void {
  listeners.get(key)?.forEach((listener) => listener());
}

/**
 * A small visitor choice (a view, a tier) remembered in `localStorage`.
 * Server and hydration render `fallback`; the stored value takes over right
 * after, so markup always matches. Values that fail `isValid` are ignored.
 * Setting `undefined` forgets the choice.
 */
export function usePersistedChoice<T extends string>(
  key: string,
  fallback: T | undefined,
  isValid: (value: unknown) => value is T,
): [T | undefined, (next: T | undefined) => void] {
  const subscribe = useCallback((listener: Listener) => subscribeKey(key, listener), [key]);
  const getSnapshot = useCallback(() => {
    const raw = memory.has(key) ? memory.get(key) : readStored(key);
    return isValid(raw) ? raw : fallback;
  }, [key, fallback, isValid]);
  const getServerSnapshot = useCallback(() => fallback, [fallback]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T | undefined) => {
      memory.set(key, next ?? null);
      writeStored(key, next ?? null);
      notify(key);
    },
    [key],
  );

  return [value, setValue];
}
