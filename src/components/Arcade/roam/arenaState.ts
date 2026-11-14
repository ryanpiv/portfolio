import type { ArenaLayout } from "@utils/arenaLayout";
import type { Aabb } from "@utils/collision";

/**
 * Mutable tower state for one free-roam session: towers can be shot down
 * by heavy weapons. Lives in a ref on the roam context; only touched inside
 * `useGameFrame`.
 */

export type TowerState = {
  box: Aabb;
  /** Footprint center; the debris spawns here. */
  center: [number, number, number];
  health: number;
  alive: boolean;
};

export type ArenaState = {
  towers: TowerState[];
};

export function createArenaState(layout: ArenaLayout, healthPerMetre: number): ArenaState {
  return {
    towers: layout.buildings.map((b) => ({
      box: b.box,
      center: [b.position[0], b.size[1] / 2, b.position[2]],
      health: b.size[1] * healthPerMetre,
      alive: true,
    })),
  };
}

/** Boxes that still block flight and bolts. */
export function aliveBoxes(state: ArenaState): Aabb[] {
  return state.towers.filter((t) => t.alive).map((t) => t.box);
}
