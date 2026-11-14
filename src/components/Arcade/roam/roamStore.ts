import { DEFAULT_WEAPON, type WeaponId } from "@data/lab";
import { createStore, type Store } from "@utils/createStore";

/**
 * Low-frequency free-roam state the DOM HUD reads: score, health, weapon,
 * whether the ship is alive, and any portal transition in flight. Published
 * on events only, never per frame.
 */

export type PortalTransition = {
  slug: string;
  title: string;
  color: string;
};

export type RoamPhase = "flying" | "dead";

export type RoamState = {
  score: number;
  kills: number;
  portals: number;
  towers: number;
  deaths: number;
  health: number;
  healthMax: number;
  weapon: WeaponId;
  phase: RoamPhase;
  /** Set once the ship flies through a ring; the DOM takes over from here. */
  transition: PortalTransition | null;
  /** Set when the visitor came back from a project: the ship emerges from that portal. */
  arrival: PortalTransition | null;
  /** Portal slug the ship should start from, consumed by the ship on its first frame. */
  spawnPortal: string | null;
};

export type RoamStore = Store<RoamState>;

function initialRoamState(healthMax: number): RoamState {
  return {
    score: 0,
    kills: 0,
    portals: 0,
    towers: 0,
    deaths: 0,
    health: healthMax,
    healthMax,
    weapon: DEFAULT_WEAPON,
    phase: "flying",
    transition: null,
    arrival: null,
    spawnPortal: null,
  };
}

export function createRoamStore(healthMax: number): RoamStore {
  return createStore<RoamState>(initialRoamState(healthMax));
}

/** Flying is live while the ship is alive and no portal has taken over. */
export function isRoamLive(state: RoamState): boolean {
  return state.phase === "flying" && state.transition === null;
}

export function recordKill(store: RoamStore, points: number): void {
  store.set((state) => ({ kills: state.kills + 1, score: state.score + points }));
}

export function recordTower(store: RoamStore, points: number): void {
  store.set((state) => ({ towers: state.towers + 1, score: state.score + points }));
}

export function addScore(store: RoamStore, points: number): void {
  store.set((state) => ({ score: state.score + points }));
}

/** Takes health off the ship; flips it to `dead` at zero. Ignored unless flying. */
export function damageHull(store: RoamStore, amount: number): void {
  store.set((state) => {
    if (!isRoamLive(state)) return {};
    const health = Math.max(0, state.health - amount);
    return { health, phase: health === 0 ? "dead" : state.phase, deaths: health === 0 ? state.deaths + 1 : state.deaths };
  });
}

export function repairHull(store: RoamStore, amount: number): void {
  store.set((state) => ({ health: Math.min(state.healthMax, state.health + amount) }));
}

export function equipWeapon(store: RoamStore, weapon: WeaponId): void {
  store.set({ weapon });
}

/** Back in the air: full health, default weapon. */
export function respawn(store: RoamStore): void {
  store.set((state) => ({ phase: "flying", health: state.healthMax, weapon: DEFAULT_WEAPON }));
}

/** Awards the portal and starts the takeover. Ignored if one is already running or the ship is down. */
export function enterPortal(store: RoamStore, transition: PortalTransition, points: number): boolean {
  if (!isRoamLive(store.get())) return false;
  store.set((state) => ({ portals: state.portals + 1, score: state.score + points, transition }));
  return true;
}

export function setSpawnPortal(store: RoamStore, slug: string): void {
  store.set({ spawnPortal: slug });
}

/** The ship emerges from `arrival`'s portal: play the wash and forget the request. */
export function startArrival(store: RoamStore, arrival: PortalTransition): void {
  store.set({ arrival, spawnPortal: null });
}

export function finishArrival(store: RoamStore): void {
  store.set({ arrival: null });
}
