import { createStore, type Store } from "@utils/createStore";

/**
 * Low-frequency free-roam state the DOM HUD reads: score and the portal
 * transition in flight. Published on events only, never per frame.
 */

export type PortalTransition = {
  slug: string;
  title: string;
  color: string;
};

export type RoamState = {
  score: number;
  kills: number;
  portals: number;
  /** Set once the ship flies through a ring; the DOM takes over from here. */
  transition: PortalTransition | null;
};

export type RoamStore = Store<RoamState>;

export const initialRoamState: RoamState = { score: 0, kills: 0, portals: 0, transition: null };

export function createRoamStore(): RoamStore {
  return createStore<RoamState>(initialRoamState);
}

/** Flying is live until a portal takes over. */
export function isRoamLive(state: RoamState): boolean {
  return state.transition === null;
}

export function recordKill(store: RoamStore, points: number): void {
  store.set((state) => ({ kills: state.kills + 1, score: state.score + points }));
}

/** Awards the portal and starts the takeover. Ignored if one is already running. */
export function enterPortal(store: RoamStore, transition: PortalTransition, points: number): boolean {
  if (!isRoamLive(store.get())) return false;
  store.set((state) => ({ portals: state.portals + 1, score: state.score + points, transition }));
  return true;
}
