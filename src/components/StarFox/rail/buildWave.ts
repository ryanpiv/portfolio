import type { WaveSpec } from "@data/lab";
import type { Project } from "@data/projects";
import type { Vec3 } from "@utils/fieldLayout";
import { formationOffsets } from "@utils/waveLayout";

import type { EnemySpawn } from "./Enemy";

/** Successive fighters in a formation sway this far apart in phase. */
const PHASE_STEP = Math.PI / 3;

export type WaveAnchor = {
  /** Distance ahead of the ship where the formation appears. */
  spawnDistance: number;
  /** Vertical centre of the formation (the ship's rest altitude). */
  altitude: number;
};

/** Turns a wave spec plus its dealt projects into positioned spawns. */
export function buildWave(waveIndex: number, spec: WaveSpec, roster: Project[], anchor: WaveAnchor): EnemySpawn[] {
  const offsets = formationOffsets(spec.formation, roster.length, spec.spacing);
  return roster.map((project, i) => {
    const offset = offsets[i];
    const start: Vec3 = [offset[0], anchor.altitude + offset[1], -anchor.spawnDistance + offset[2]];
    return { id: `${waveIndex}-${project.slug}`, project, offset, phase: i * PHASE_STEP, start };
  });
}
