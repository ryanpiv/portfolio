"use client";

import { useSyncExternalStore } from "react";

import type { Store } from "@utils/createStore";

/**
 * Subscribes a component to a `createStore` store. The selector must return
 * a stable value for an unchanged state (a primitive or the state object
 * itself); build derived objects in render instead.
 */
export function useStore<T extends object, U = T>(store: Store<T>, selector: (state: T) => U = identity): U {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(store.get()),
  );
}

function identity<T, U>(state: T): U {
  return state as unknown as U;
}
