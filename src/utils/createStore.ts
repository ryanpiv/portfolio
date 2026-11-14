/**
 * Minimal external store: a snapshot plus subscribers. Pairs with
 * `useStore` so render loops (e.g. three.js `useFrame`) can publish state
 * that React reads without re-rendering per frame.
 */

export type Patch<T> = Partial<T> | ((state: T) => Partial<T>);

export type Store<T extends object> = {
  get: () => T;
  /** Shallow-merges a patch; subscribers are notified only if something changed. */
  set: (patch: Patch<T>) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();

  const set = (patch: Patch<T>) => {
    const next = typeof patch === "function" ? patch(state) : patch;
    const changed = (Object.keys(next) as (keyof T)[]).some((key) => !Object.is(state[key], next[key]));
    if (!changed) return;
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  };

  return {
    get: () => state,
    set,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
